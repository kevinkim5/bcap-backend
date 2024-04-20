// to get the unique object id for the user from mongodb user._id.toString()
const axios = require("axios");
const queryString = require("node:querystring");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const router = express.Router();
const Logger = require("../../logger");
const logger = Logger(path.basename(__filename));
// const { config } = require("../../index");
dotenv.config();
const config = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  redirectUrl: process.env.REDIRECT_URL,
  clientUrl: process.env.CLIENT_URL,
  tokenSecret: process.env.TOKEN_SECRET,
  tokenExpiration: 36000,
  postUrl: "https://jsonplaceholder.typicode.com/posts",
};

const authParams = queryString.stringify({
  client_id: config.clientId,
  redirect_uri: config.redirectUrl,
  response_type: "code",
  scope: "openid profile email",
  access_type: "offline",
  state: "standard_oauth",
  prompt: "consent",
});
const getTokenParams = (code) =>
  queryString.stringify({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUrl,
  });

// Verify auth
const auth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    jwt.verify(token, config.tokenSecret);
    return next();
  } catch (err) {
    console.error("Error: ", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/url", (_, res) => {
  res.json({
    url: `${config.authUrl}?${authParams}`,
  });
});

router.get("/token", async (req, res) => {
  logger.info(`${req.path}`);
  const { code } = req.query;
  console.log(code);
  if (!code)
    return res
      .status(400)
      .json({ message: "Authorization code must be provided" });
  try {
    // Get all parameters needed to hit authorization server
    const tokenParam = getTokenParams(code);
    console.log(`${config.tokenUrl}?${tokenParam}`);
    // Exchange authorization code for access token (id token is returned here too)
    const { data } = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?client_id=${code}`);
    console.log(data);
    if (!id_token) return res.status(400).json({ message: "Auth error" });
    // Get user info from id token
    const { email, name, picture } = jwt.decode(id_token);
    const user = { name, email, picture };
    // Sign a new token
    const token = jwt.sign({ user }, config.tokenSecret, {
      expiresIn: config.tokenExpiration,
    });
    // Set cookies for user
    res.cookie("token", token, {
      maxAge: config.tokenExpiration,
      httpOnly: true,
    });
    // You can choose to store user in a DB instead
    res.json({
      user,
    });
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.get("/logged_in", (req, res) => {
  try {
    logger.info("GET: /auth/logged_in");
    // Get token from cookie
    const token = req.cookies.token;
    if (!token) return res.json({ loggedIn: false });
    const { user } = jwt.verify(token, config.tokenSecret);
    const newToken = jwt.sign({ user }, config.tokenSecret, {
      expiresIn: config.tokenExpiration,
    });
    // Reset token in cookie
    res.cookie("token", newToken, {
      maxAge: config.tokenExpiration,
      httpOnly: true,
    });
    res.json({ loggedIn: true, user });
  } catch (err) {
    res.json({ loggedIn: false });
  }
});

router.post("/logout", (_, res) => {
  // clear cookie
  res.clearCookie("token").json({ message: "Logged out" });
});

module.exports = router;
