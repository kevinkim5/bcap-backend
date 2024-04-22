const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
dotenv.config();

// setup logger
const Logger = require("../logger");
const logger = Logger(path.basename(__filename));

const mongoString = process.env.MONGO_URI;
var _db;

module.exports = {
  connectToServer: function (callback) {
    logger.info("Connecting to MongoDB...");
    mongoose.connect(mongoString);
    _db = mongoose.connection;

    _db.on("error", (error) => {
      logger.error(error);
      callback(error);
    });

    _db.once("connected", () => {
      logger.info("Database Connected");
      callback(false);
    });
  },

  getDb: function () {
    return _db;
  },
};
