/**
 * src/modules/visitor/visitor.validator.js
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, "Validation failed", 422, errors.array());
  next();
};

const logVisitorValidator = [
  body("studentId").notEmpty().withMessage("Student ID is required"),
  body("name").trim().notEmpty().withMessage("Visitor name is required"),
  body("phone").notEmpty().withMessage("Visitor phone is required").isMobilePhone("en-IN").withMessage("Invalid phone number"),
  body("relation").trim().notEmpty().withMessage("Relation to student is required"),
  body("purpose").optional().trim(),
  handleValidationErrors,
];

module.exports = { logVisitorValidator };
