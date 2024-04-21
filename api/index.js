const axios = require("axios");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const queryString = require("node:querystring");
const upload = multer();

dotenv.config();

const mongoUtil = require("./db/mongoUtil");
const sessionOptions = require("./config/session");
const userModel = require("./models/userModel");

const PORT = process.env.PORT || "3000";

// setup logger
const Logger = require("./logger");
const logger = Logger(path.basename(__filename));

// routes
const chatRoutes = require("./routes/chat");
const historyRoutes = require("./routes/history");
const sessionRoutes = require("./routes/session");
const usersRouter = require("./routes/users");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Resolve CORS
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);

// Parse Cookie
app.use(cookieParser());

// Handle body and formdata
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.any());

// Session
app.use(session(sessionOptions));

app.get("/", (req, res) => res.status(200).send("Backend OK"));

app.post("/login", async function (req, res, next) {
  logger.info(req.path);
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

// used to check for valid session on initial load
app.use("/session", sessionRoutes);

// check for valid session with each API call
app.use(function (req, res, next) {
  const sessionData = req.session;
  logger.info(
    `${req.path} - isLoggedIn: ${sessionData && sessionData.isLoggedIn}`
  );
  if (!sessionData || !sessionData.isLoggedIn) {
    res.status(403).json({ err: "Session Expired" });
  } else {
    next();
  }
});

app.use("/chat", chatRoutes);
app.use("/history", historyRoutes);
app.use("/users", usersRouter);

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
      // console.log(err);
      logger.error(err);
      setTimeout(connectWithRetry, 5000);
    } else {
      app.listen(PORT, () => logger.info(`Server ready on port ${PORT}.`));
    }
  });
};
connectWithRetry();

module.exports = app;
