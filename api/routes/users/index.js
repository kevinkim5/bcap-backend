const express = require("express");
const path = require("path");
const router = express.Router();
const Logger = require("../../logger");
const logger = Logger(path.basename(__filename));

var mongoUtil = require("../../db/mongoUtil");
const collections = require("../../db/collections");
const userModel = require("../../models/userModel");

router.get("/", async function (req, res, next) {
  logger.info("GET: Fetching users");
  try {
    const db = mongoUtil.getDb();
    let collection = db.collection(collections.USERS);
    let results = await collection.find({}).toArray();
    logger.info(results);

    res.json(results);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
});

router.post("/login", async function (req, res, next) {
  logger.info(req.path);
  try {
    console.log(req.body.name);
    const db = mongoUtil.getDb();
    let collection = db.collection(collections.USERS);
    // let results = await collection.find({}).toArray();
    const data = new userModel({
      name: req.body.name,
      email: req.body.email,
      // timestamp: req.body.timestamp,
    });
    console.log(data);
    const logUserInDB = await userModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: { updatedAt: new Date() }, // Update name and updatedAt
        $setOnInsert: { email: req.body.email, createdAt: new Date() }, // Create if not found
      },
      { new: true, upsert: true }
    );
    console.log(logUserInDB);
    res.status(200).json(logUserInDB);
  } catch (err) {
    logger.error(err);
    res.status(400).json({ message: err });
  }
});

module.exports = router;
