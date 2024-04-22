const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const upload = multer();

// local imports
const mongoUtil = require("./db/mongoUtil");
const sessionOptions = require("./config/session");
const userModel = require("./models/userModel");
const chatRoutes = require("./routes/chat");
const historyRoutes = require("./routes/history");
const sessionRoutes = require("./routes/session");

// set up config and port
dotenv.config();
const CLIENT_URL = process.env.CLIENT_URL;
const PORT = process.env.PORT || "3000";

// set up logger
const Logger = require("./logger");
const logger = Logger(path.basename(__filename));

// start express app set up
const app = express();
app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// Resolve CORS
app.use(cors({ credentials: true, origin: [CLIENT_URL] }));

// Parse Cookie
app.use(cookieParser());

// Handle body and formdata
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.any());

// Session
app.use(session(sessionOptions));

// Test Query
app.get("/", (req, res) => res.status(200).send("Backend OK"));

// place login route before check for session
// login will assign the session
app.post("/", async function (req, res, next) {
  logger.info(req.baseUrl);
  try {
    const logUserInDB = await userModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          name: req.body.name,
          picture: req.body.picture || "",
          updatedAt: new Date(),
        },
        // Create if not found
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    req.session.isLoggedIn = true;
    req.session.user = {
      email: req.body.email,
      name: req.body.name,
      picture: req.body.picture,
    };
    res.status(200).json(logUserInDB);
  } catch (err) {
    logger.error(err);
    res.status(400).json({ message: err.message });
  }
});

// check for valid session with each API call
app.use(function (req, res, next) {
  const sessionData = req.session;
  if (!sessionData || !sessionData.isLoggedIn) {
    logger.info(`${req.baseUrl} - Session Expired`);
    res.status(403).json({ isLoggedIn: false, err: "Session Expired" });
  } else {
    next();
  }
});

// use common router for cleanliness
app.use("/chat", chatRoutes);
app.use("/history", historyRoutes);
app.use("/session", sessionRoutes);

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error(err);
      res.status(422).send({ err: err.message });
    } else {
      res.clearCookie(process.env.SESSION_NAME);
      res.send({ loggedIn: false });
    }
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(err.message, err.stack);
  res.status(statusCode).json({ error: err.message });
  return;
});

// Connect to DB before starting app
const connectWithRetry = function () {
  // retry connection if connection fails
  // need to be able to connect to MongoDB before API can be started
  return mongoUtil.connectToServer(function (err, client) {
    if (err) {
      logger.error(err);
      setTimeout(connectWithRetry, 5000);
    } else {
      app.listen(PORT, () => logger.info(`Server ready on port ${PORT}.`));
    }
  });
};
connectWithRetry();

module.exports = app;
