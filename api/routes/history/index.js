// node --version # Should be >= 18
// npm install @google/generative-ai
const dotenv = require("dotenv");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const express = require("express");
const path = require("path");
const router = express.Router();

const Logger = require("../../logger");
const chatHistoryModel = require("../../models/chatModel");
const logger = Logger(path.basename(__filename));

dotenv.config();

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.0-pro";
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

router.get("/:email", async function (req, res, next) {
  try {
    logger.info(req.baseUrl);
    const email = req.params.email;
    const chatHistory = await chatHistoryModel
      .find({ email: email })
      .sort([["updatedAt", -1]]);

    res.status(200).json(chatHistory);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
