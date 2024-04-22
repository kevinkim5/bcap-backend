const express = require("express");
const router = express.Router();

const chatRoutes = require("./chat");
const historyRoutes = require("./history");
const logoutRoute = require("./logout");
const sessionRoutes = require("./session");

router.use("/chat", chatRoutes);
router.use("/history", historyRoutes);
router.use("/logout", logoutRoute);
router.use("/session", sessionRoutes);

module.exports = router;
