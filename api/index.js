const axios = require("axios");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const queryString = require("node:querystring");
const upload = multer();

dotenv.config();

const mongoUtil = require("./db/mongoUtil");

// setup logger
const logger = Logger(path.basename(__filename));
const Logger = require("./logger");

// routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const historyRoutes = require("./routes/history");
const usersRouter = require("./routes/users");

mongoUtil.connectToServer(function (err, client) {
  if (err) console.log(err);
});

const app = express();
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

app.get("/", (req, res) => res.status(200).send("Backend OK"));

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/history", historyRoutes);
app.use("/users", usersRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(err.message, err.stack);
  res.status(statusCode).json({ error: err.message });
  return;
});

const PORT = process.env.PORT || "3000";
app.listen(PORT, () => logger.info(`Server ready on port ${PORT}.`));

module.exports = app;
