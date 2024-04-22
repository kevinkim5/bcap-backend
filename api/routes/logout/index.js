const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const router = express.Router();

const Logger = require("../../logger");

// set up
dotenv.config();
const logger = Logger(path.basename(__filename));

router.get("/", (req, res) => {
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

module.exports = router;
