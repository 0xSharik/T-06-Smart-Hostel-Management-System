/**
 * src/config/env.js — Environment Configuration
 *
 * Responsibilities:
 *  - Validate that all required environment variables are present at startup
 *  - Export them as named constants so the rest of the app never uses process.env directly
 *  - Fail fast with a clear error message if a required variable is missing
 *
 * This prevents silent failures caused by undefined env vars deep inside modules.
 */

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
];

// Validate required env variables on startup
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`   Please check your .env file against .env.example`);
    process.exit(1);
  }
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "fallback_cookie_secret",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
};
