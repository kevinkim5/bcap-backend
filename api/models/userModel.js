const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
