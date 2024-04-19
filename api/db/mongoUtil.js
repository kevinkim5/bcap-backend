const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const mongoString = process.env.MONGO_URI;
var _db;

module.exports = {
  connectToServer: function (callback) {
    mongoose.connect(mongoString);
    _db = mongoose.connection;

    _db.on("error", (error) => {
      console.log(error);
      callback(error);
    });

    _db.once("connected", () => {
      console.log("Database Connected");
    });
  },

  getDb: function () {
    return _db;
  },
};