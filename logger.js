const winston = require("winston");

const { combine, timestamp, printf, errors } = winston.format;

const customFormat = printf(
  ({ level, message, stack }) => `[${level}]: ${stack || message}`
);

module.exports = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Capture stack traces
    customFormat
  ),
  transports: [new winston.transports.Console()],
});
