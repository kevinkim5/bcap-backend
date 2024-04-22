const express = require("express");
const router = express.Router();

const chatRoutes = require("./chat");
const historyRoutes = require("./history");
const logoutRoute = require("./logout");
const sessionRoutes = require("./session");
const usersRouter = require("./users");

router.use("/chat", chatRoutes);
router.use("/history", historyRoutes);
router.use("/logout", logoutRoute);
router.use("/session", sessionRoutes);
router.use("/users", usersRouter);

module.exports = router;
