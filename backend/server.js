/**
 * server.js — Application Entry Point
 *
 * Responsibilities:
 *  - Load environment variables FIRST (before any other import)
 *  - Import the configured Express app
 *  - Start the HTTP server on the configured port
 *  - Handle uncaught exceptions and unhandled rejections gracefully
 *
 * This file intentionally contains NO business logic.
 */

require("dotenv").config();
require("express-async-errors"); // Patches async route handlers to forward errors to Express error middleware

const app = require("./src/app");
const logger = require("./src/lib/logger");
const { PORT, NODE_ENV } = require("./src/config/env");

const port = PORT || 5000;

// ── Start HTTP Server ──────────────────────────────────────────────────────────
const server = app.listen(port, () => {
  logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${port}`);
  logger.info(`📡 API available at http://localhost:${port}/api`);
});

// ── Graceful Shutdown ──────────────────────────────────────────────────────────
// Handle cases where the process is about to exit due to unhandled errors
// This prevents the process from leaving zombie database connections.

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION 💥 Shutting down...");
  logger.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated.");
  });
});
