/**
 * src/modules/auth/auth.validator.js — Auth Request Validators
 *
 * Uses express-validator to validate incoming request bodies.
 * These run BEFORE the controller — invalid input never reaches business logic.
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

/**
 * Middleware to check validation results and return errors if any.
 * Must be added AFTER the validation rules in the route chain.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation failed", 422, errors.array());
  }
  next();
};

const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  body("role")
    .optional()
    .isIn(["ADMIN", "WARDEN", "STUDENT"])
    .withMessage("Role must be ADMIN, WARDEN, or STUDENT"),

  handleValidationErrors,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain uppercase, lowercase, and a number"),

  handleValidationErrors,
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  handleValidationErrors,
};
