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

dotenv.config();
const logger = Logger(path.basename(__filename));

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.0-pro";
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

async function runChat(question, history) {
  try {
    logger.info(`Question received: ${question}`);
    console.log(history);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: history,
    });

    logger.info("Sending question");
    const result = await chat.sendMessage(question);
    const response = result.response;
    console.log(response);
    return response.text();
  } catch (err) {
    logger.error(err);
    throw Error(err);
  }
}

router.post("/", async function (req, res, next) {
  logger.info("POST: Asking a question");
  try {
    if (req.body.question) {
      const currentHistory = JSON.parse(req.body.history);
      const question = req.body.question;
      const geminiResponse = await runChat(question);

      const newHistory = [
        ...currentHistory,
        {
          role: "user",
          parts: [{ text: question }],
        },
        {
          role: "model",
          parts: [{ text: geminiResponse }],
        },
      ];
      const data = chatHistoryModel({
        email: req.body.email,
        history: newHistory,
        title: question,
      });

      if (req.body.chatId === undefined) {
        // create a new record for a new chat
        logger.info("Creating a new conversation history");
        const dbRes = await chatHistoryModel.create(data);
        res.status(200).json(dbRes);
      } else {
        // this is a continuation of an existing chat, add on in the DB
        logger.info("Updating conversation history");
        const id = req.body.chatId;
        const chatHistoryUpdate = await chatHistoryModel.findByIdAndUpdate(
          id,
          {
            $set: {
              email: req.body.email,
              history: newHistory,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
        res.status(200).json(chatHistoryUpdate);
      }
    } else {
      res.status(400).json({ error: "Invalid Question" });
    }
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    logger.info(`${req.baseUrl}: ${req.body.id}`);
    const deleteChat = await chatHistoryModel.deleteOne({ _id: req.body.id });
    res.status(200).json({ deleted: true, id: req.body.id, ...deleteChat });
  } catch (err) {
    logger.error(err);
    res.status(400).json({ deleted: false, err: err.message });
  }
});

module.exports = router;
