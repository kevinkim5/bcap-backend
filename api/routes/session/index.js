const express = require("express");
const path = require("path");
const router = express.Router();
const Logger = require("../../logger");
const logger = Logger(path.basename(__filename));

router.get("", (req, res) => {
  if (!req.session || !req.session.isLoggedIn) {
    logger.info(`${req.path}: Session Expired`);
    res
      .status(403)
      .json({ isLoggedIn: req.session.isLoggedIn, err: "Session Expired" });
  } else {
    res.status(200).json({
      isLoggedIn: req.session.isLoggedIn,
      ...req.session.user,
    });
  }
});

module.exports = router;
