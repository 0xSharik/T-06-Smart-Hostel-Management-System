/**
 * src/modules/auth/auth.controller.js — Auth Controller
 *
 * Responsibilities:
 *  - Receive HTTP request
 *  - Extract and pass data to the service
 *  - Set/clear auth cookie
 *  - Return standardized response
 *
 * NO business logic lives here. Controllers are thin wrappers.
 */

const authService = require("./auth.service");
const { sendSuccess } = require("../../utils/response");
const { IS_PRODUCTION } = require("../../config/env");

/**
 * Helper: attach JWT to an HTTP-only cookie.
 */
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,                  // JS cannot read this cookie (XSS protection)
    secure: IS_PRODUCTION,           // HTTPS only in production
    sameSite: IS_PRODUCTION ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.registerUser({ name, email, password, role });

  setAuthCookie(res, token);

  return sendSuccess(res, { user, token }, "Account created successfully.", 201);
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  setAuthCookie(res, token);

  return sendSuccess(res, { user, token }, "Login successful.");
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, user, "Profile fetched successfully.");
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  // Clear the HTTP-only cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "strict" : "lax",
  });

  return sendSuccess(res, null, "Logged out successfully.");
};

/**
 * PATCH /api/auth/change-password
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, { currentPassword, newPassword });
  return sendSuccess(res, null, "Password changed successfully.");
};

module.exports = { register, login, getMe, logout, changePassword };
