const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

dotenv.config();

const mongoUtil = require( './db/mongoUtil' );
const Logger = require("./logger");
const usersRouter = require("./routes/users");

const logger = Logger(path.basename(__filename));

mongoUtil.connectToServer( function( err, client ) {
  if (err) console.log(err);
  // start the rest of your app here
} );

const app = express();
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  console.log(res)
});
app.use("/users", usersRouter);


const PORT = process.env.PORT || "3000";
app.listen(PORT, () => logger.info(`Server ready on port ${PORT}.`));

module.exports = app;
