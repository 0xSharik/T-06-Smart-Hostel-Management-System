/**
 * src/app.js — Express Application Setup
 *
 * Responsibilities:
 *  - Configure the Express app with all middleware
 *  - Mount all routes
 *  - Register error handlers (MUST be last)
 *
 * Middleware order matters — follow this order strictly:
 *  1. Security middleware (helmet, cors)
 *  2. Body parsers (json, urlencoded)
 *  3. Cookie parser
 *  4. Request logger (morgan)
 *  5. Routes
 *  6. 404 handler
 *  7. Error handler (MUST be last)
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { FRONTEND_URL, IS_DEVELOPMENT } = require("./config/env");
const logger = require("./lib/logger");
const routes = require("./routes/index");
const notFoundMiddleware = require("./middleware/notFound.middleware");
const { errorMiddleware } = require("./middleware/error.middleware");

const app = express();

// ── 1. Security Headers ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── 2. CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = FRONTEND_URL.split(",").map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin ${origin} not allowed.`), false);
    },
    credentials: true, // Allow cookies to be sent cross-origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── 3. Body Parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── 4. Cookie Parser ──────────────────────────────────────────────────────────
app.use(cookieParser());

// ── 5. HTTP Request Logger ────────────────────────────────────────────────────
// Route morgan logs through winston for unified log handling
const morganStream = {
  write: (message) => logger.info(message.trim()),
};

app.use(
  morgan(IS_DEVELOPMENT ? "dev" : "combined", {
    stream: morganStream,
    // Skip logging for health checks to reduce noise
    skip: (req) => req.url === "/api/health",
  })
);

// ── 6. Trust Proxy ────────────────────────────────────────────────────────────
// Required if behind a reverse proxy (nginx) to get real client IP
app.set("trust proxy", 1);

// ── 7. API Routes ─────────────────────────────────────────────────────────────
app.use("/api", routes);

// ── 8. Root route ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Hostel Management System API",
    docs: "/api/health",
    version: "1.0.0",
  });
});

// ── 9. 404 Handler (after all routes) ────────────────────────────────────────
app.use(notFoundMiddleware);

// ── 10. Global Error Handler (MUST be last) ───────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
