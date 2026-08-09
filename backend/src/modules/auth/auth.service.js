/**
 * src/modules/auth/auth.service.js — Auth Business Logic
 *
 * Responsibilities:
 *  - All business logic for authentication lives here
 *  - Controllers call service functions; services never touch req/res
 *  - Throws AppError for all expected failure cases
 *
 * Functions:
 *  - registerUser   — Create a new user account
 *  - loginUser      — Validate credentials, return JWT + user data
 *  - getMe          — Fetch current authenticated user's profile
 *  - changePassword — Update user password after verifying current one
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } = require("../../config/env");

/**
 * Generate a JWT token for a given user ID.
 */
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Register a new user.
 * Only ADMIN can create ADMIN or WARDEN accounts (enforced at route level).
 *
 * @param {object} data - { name, email, password, role }
 * @returns {{ user, token }}
 */
const registerUser = async ({ name, email, password, role = "STUDENT" }) => {
  // Check if email is already taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken(user.id);
  return { user, token };
};

/**
 * Authenticate a user and return a JWT.
 *
 * @param {object} data - { email, password }
 * @returns {{ user, token }}
 */
const loginUser = async ({ email, password }) => {
  // Find user — include password for comparison
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, password: true, createdAt: true },
  });

  // Use a generic error message — never reveal whether email or password is wrong
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = signToken(user.id);
  return { user: userWithoutPassword, token };
};

/**
 * Get the current authenticated user's profile.
 *
 * @param {string} userId
 * @returns {object} user
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          rollNo: true,
          course: true,
          year: true,
          phone: true,
          room: {
            select: { id: true, roomNo: true, floor: true },
          },
        },
      },
    },
  });

  if (!user) throw new AppError("User not found.", 404);
  return user;
};

/**
 * Change the authenticated user's password.
 *
 * @param {string} userId
 * @param {object} data - { currentPassword, newPassword }
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) throw new AppError("User not found.", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError("New password must be different from the current password.", 400);
  }

  const hashedNew = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNew },
  });
};

module.exports = { registerUser, loginUser, getMe, changePassword };
