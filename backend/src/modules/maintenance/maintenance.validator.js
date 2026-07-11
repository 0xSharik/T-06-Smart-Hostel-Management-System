/**
 * src/modules/maintenance/maintenance.validator.js
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, "Validation failed", 422, errors.array());
  next();
};

const createMaintenanceValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }).withMessage("Title too long"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category")
    .optional()
    .isIn(["ELECTRICAL", "PLUMBING", "FURNITURE", "CLEANING", "INTERNET", "AC", "OTHER"])
    .withMessage("Invalid category"),
  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .withMessage("Priority must be LOW, MEDIUM, HIGH, or URGENT"),
  body("roomId").optional(),
  handleValidationErrors,
];

const updateStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"])
    .withMessage("Invalid status"),
  body("remarks").optional().trim(),
  handleValidationErrors,
];

module.exports = { createMaintenanceValidator, updateStatusValidator };
