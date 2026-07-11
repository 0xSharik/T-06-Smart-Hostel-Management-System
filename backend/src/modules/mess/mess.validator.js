/**
 * src/modules/mess/mess.validator.js
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, "Validation failed", 422, errors.array());
  next();
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEALS = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

const createMenuValidator = [
  body("day").notEmpty().isIn(DAYS).withMessage(`Day must be one of: ${DAYS.join(", ")}`),
  body("mealType").notEmpty().isIn(MEALS).withMessage(`Meal type must be one of: ${MEALS.join(", ")}`),
  body("items").isArray({ min: 1 }).withMessage("Items must be a non-empty array"),
  body("items.*").isString().withMessage("Each item must be a string"),
  body("description").optional().trim(),
  handleValidationErrors,
];

const updateMenuValidator = [
  body("items").optional().isArray({ min: 1 }).withMessage("Items must be a non-empty array"),
  body("description").optional().trim(),
  handleValidationErrors,
];

const feedbackValidator = [
  body("messMenuId").notEmpty().withMessage("Menu ID is required"),
  body("rating").notEmpty().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().trim().isLength({ max: 500 }).withMessage("Comment too long"),
  handleValidationErrors,
];

module.exports = { createMenuValidator, updateMenuValidator, feedbackValidator };
