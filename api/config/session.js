const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");

dotenv.config();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  ttl: 14 * 24 * 60 * 60,
  autoRemove: "native",
});

// set using env vars in minutes
const maxAgeEnv = parseInt(process.env.SESSION_MAX_AGE) || 60;

const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * maxAgeEnv, // in milliseconds, 1 hour session
    httpOnly: true,
    // signed: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  },
  saveUninitialized: true,
  resave: false,
  store: sessionStore,
};

module.exports = sessionOptions;
