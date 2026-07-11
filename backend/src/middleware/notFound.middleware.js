/**
 * src/middleware/notFound.middleware.js — 404 Not Found Handler
 *
 * Responsibilities:
 *  - Catch requests to routes that don't exist
 *  - Return a clean 404 response
 *
 * This must be registered AFTER all routes, but BEFORE the error middleware.
 * When a request doesn't match any route, Express falls through to this handler.
 */

const { sendError } = require("../utils/response");

const notFoundMiddleware = (req, res, next) => {
  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
};

module.exports = notFoundMiddleware;
