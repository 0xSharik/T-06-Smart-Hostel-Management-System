/**
 * src/lib/prisma.js — Singleton Prisma Client
 *
 * Responsibilities:
 *  - Export a single shared Prisma client instance used across all modules
 *  - In development, prevent hot-reload from creating multiple connections
 *    (Node.js module caching handles this in production)
 *  - Log slow queries in development for debugging
 *
 * Why singleton: Prisma manages a connection pool internally. Creating multiple
 * PrismaClient instances wastes connections and can exhaust the pool limit.
 */

const { PrismaClient } = require("@prisma/client");
const { IS_DEVELOPMENT } = require("../config/env");

// In development, attach to global to survive hot reloads (nodemon)
// In production, module caching ensures a single instance
let prisma;

if (IS_DEVELOPMENT) {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "warn", "error"],
    });
  }
  prisma = global.__prisma;
} else {
  prisma = new PrismaClient({
    log: ["warn", "error"],
  });
}

module.exports = prisma;
