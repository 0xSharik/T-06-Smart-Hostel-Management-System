/**
 * src/middleware/auth.middleware.js — Authentication & Authorization Middleware
 *
 * Responsibilities:
 *  - `protect`: Verify JWT from Authorization header OR HTTP-only cookie.
 *               Attaches the decoded user to req.user on success.
 *  - `authorize`: Role-based access control guard factory.
 *                 Pass the allowed roles; it rejects unauthorized users.
 *
 * Token lookup order:
 *   1. Authorization: Bearer <token>  (useful for Postman / mobile clients)
 *   2. req.cookies.token              (secure HTTP-only cookie for web browsers)
 *
 * Usage:
 *   router.get('/admin', protect, authorize('ADMIN'), controller.fn)
 *   router.get('/staff',  protect, authorize('ADMIN', 'WARDEN'), controller.fn)
 */

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const prisma = require("../lib/prisma");
const { sendError } = require("../utils/response");

/**
 * protect — Verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2. Fall back to HTTP-only cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, "Not authenticated. Please log in.", 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendError(res, "Session expired. Please log in again.", 401);
      }
      return sendError(res, "Invalid token. Please log in again.", 401);
    }

    // Fetch user from DB — ensures user still exists and is not deleted
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, "User no longer exists.", 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * authorize — Role-based access guard
 *
 * @param {...string} roles - Allowed roles (e.g., 'ADMIN', 'WARDEN', 'STUDENT')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Not authenticated.", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. This action requires one of the following roles: ${roles.join(", ")}.`,
        403
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
