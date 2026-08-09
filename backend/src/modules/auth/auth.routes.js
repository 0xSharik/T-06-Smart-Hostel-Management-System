/**
 * src/modules/auth/auth.routes.js — Auth Routes
 *
 * Responsibilities:
 *  - Define all authentication endpoints
 *  - Apply validators and auth middleware
 *  - Delegate to controller functions
 *
 * Public routes  — no auth required
 * Protected routes — require valid JWT (protect middleware)
 */

const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");
const { registerValidator, loginValidator, changePasswordValidator } = require("./auth.validator");
const { protect } = require("../../middleware/auth.middleware");

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);

// ── Protected Routes ──────────────────────────────────────────────────────────
router.get("/me", protect, authController.getMe);
router.post("/logout", protect, authController.logout);
router.patch("/change-password", protect, changePasswordValidator, authController.changePassword);

module.exports = router;
