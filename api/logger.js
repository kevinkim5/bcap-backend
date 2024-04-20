const { format, createLogger, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const customFormat = (filename) =>
  printf(
    (info) => `${info.timestamp} [${filename}] ${info.level}: ${info.message}`
  );

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const Logger = (filename) => {
  return createLogger({
    levels: logLevels,
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      customFormat(filename)
    ),
    transports: [new transports.Console()],
  });
};

module.exports = Logger;
