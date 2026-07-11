/**
 * src/middleware/error.middleware.js — Centralized Error Handler
 *
 * Responsibilities:
 *  - Catch ALL errors thrown anywhere in the application (routes, services, etc.)
 *  - Differentiate between operational errors (known, expected) and programming errors
 *  - Return clean JSON error responses (never raw stack traces in production)
 *  - Log errors appropriately
 *
 * AppError class:
 *  - Used throughout the app to throw intentional, user-facing errors
 *  - Has statusCode and isOperational properties
 *
 * This MUST be the LAST middleware registered in app.js.
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Email already in use', 409);
 */

const logger = require("../lib/logger");
const { sendError } = require("../utils/response");
const { IS_PRODUCTION } = require("../config/env");

/**
 * Custom operational error class.
 * Operational = known error that we can show to the user safely.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.isOperational = true;
    // Capture stack trace (excludes AppError constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Prisma-specific errors and convert them to user-friendly messages.
 */
const handlePrismaError = (err) => {
  switch (err.code) {
    case "P2002": {
      // Unique constraint violation
      const field = err.meta?.target?.join(", ") || "field";
      return new AppError(`Duplicate value: A record with this ${field} already exists.`, 409);
    }
    case "P2025":
      // Record not found
      return new AppError("Record not found.", 404);
    case "P2003":
      // Foreign key constraint violation
      return new AppError("Related record does not exist.", 400);
    case "P2000":
      return new AppError("Input value is too long for this field.", 400);
    default:
      return new AppError("Database operation failed.", 500);
  }
};

/**
 * Handle JWT errors.
 */
const handleJWTError = () => new AppError("Invalid token. Please log in again.", 401);
const handleJWTExpiredError = () => new AppError("Token expired. Please log in again.", 401);

/**
 * The global error handling middleware.
 * Must have exactly 4 parameters for Express to recognize it as an error handler.
 */
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // ── Map known error types ──────────────────────────────────────────────────

  // Prisma errors
  if (err.code && err.code.startsWith("P")) {
    error = handlePrismaError(err);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  // ── Determine status code ──────────────────────────────────────────────────
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // ── Log error ──────────────────────────────────────────────────────────────
  if (statusCode >= 500) {
    logger.error("Server Error", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn("Client Error", {
      message: err.message,
      statusCode,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ── Send response ──────────────────────────────────────────────────────────
  // In production, never expose internal error details for non-operational errors
  const message =
    IS_PRODUCTION && !isOperational
      ? "Something went wrong. Please try again later."
      : error.message || "Internal Server Error";

  return sendError(res, message, statusCode);
};

module.exports = { errorMiddleware, AppError };
