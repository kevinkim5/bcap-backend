const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    email: {
      required: true,
      type: String,
    },
    history: {
      required: true,
      type: Array,
    },
    title: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("chat_histories", chatHistorySchema);
