const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const router = express.Router();

const Logger = require("../../logger");
const userModel = require("../../models/userModel");

// set up
dotenv.config();
const logger = Logger(path.basename(__filename));

router.post("/", async function (req, res, next) {
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

module.exports = router;
