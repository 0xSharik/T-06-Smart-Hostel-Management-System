/**
 * src/modules/holiday/holiday.validator.js
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, "Validation failed", 422, errors.array());
  next();
};

const createHolidayValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("date").notEmpty().withMessage("Date is required").isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("type")
    .optional()
    .isIn(["PUBLIC", "RESTRICTED", "HOSTEL_SPECIFIC"])
    .withMessage("Type must be PUBLIC, RESTRICTED, or HOSTEL_SPECIFIC"),
  body("description").optional().trim(),
  handleValidationErrors,
];

const updateHolidayValidator = [
  body("title").optional().trim().notEmpty(),
  body("date").optional().isISO8601().withMessage("Invalid date"),
  body("type").optional().isIn(["PUBLIC", "RESTRICTED", "HOSTEL_SPECIFIC"]),
  body("description").optional().trim(),
  handleValidationErrors,
];

module.exports = { createHolidayValidator, updateHolidayValidator };
