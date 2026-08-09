/**
 * src/lib/logger.js — Winston Logger
 *
 * Responsibilities:
 *  - Provide a centralized, structured logger used across the entire app
 *  - Log to console (always) and files (in production)
 *  - Use JSON format in production for machine-parseable logs
 *  - Use colorized format in development for human-readable logs
 *
 * Usage:
 *   const logger = require('../lib/logger');
 *   logger.info('User logged in', { userId: 123 });
 *   logger.error('Something failed', { error: err.message });
 */

const winston = require("winston");
const { IS_PRODUCTION } = require("../config/env");

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

// Custom format for development: readable, colorized
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  })
);

// JSON format for production: structured, machine-parseable
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports = [
  new winston.transports.Console(),
];

// Add file transports only in production
if (IS_PRODUCTION) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: IS_PRODUCTION ? "warn" : "debug",
  format: IS_PRODUCTION ? prodFormat : devFormat,
  transports,
  // Prevent logger itself from crashing the app on error
  exitOnError: false,
});

module.exports = logger;
