/**
 * src/modules/student/student.validator.js
 */

const { body, query, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, "Validation failed", 422, errors.array());
  next();
};

const createStudentValidator = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("rollNo").trim().notEmpty().withMessage("Roll number is required"),
  body("course").trim().notEmpty().withMessage("Course is required"),
  body("year")
    .notEmpty().withMessage("Year is required")
    .isInt({ min: 1, max: 6 }).withMessage("Year must be between 1 and 6"),
  body("phone")
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone("en-IN").withMessage("Please provide a valid Indian phone number"),
  body("parentName").optional().trim(),
  body("parentPhone").optional().isMobilePhone("en-IN").withMessage("Invalid parent phone"),
  body("address").optional().trim(),
  handleValidationErrors,
];

const updateStudentValidator = [
  body("course").optional().trim().notEmpty().withMessage("Course cannot be empty"),
  body("year").optional().isInt({ min: 1, max: 6 }).withMessage("Year must be 1–6"),
  body("phone").optional().isMobilePhone("en-IN").withMessage("Invalid phone number"),
  body("parentName").optional().trim(),
  body("parentPhone").optional().isMobilePhone("en-IN").withMessage("Invalid parent phone"),
  body("address").optional().trim(),
  handleValidationErrors,
];

const assignRoomValidator = [
  body("roomId").notEmpty().withMessage("Room ID is required"),
  handleValidationErrors,
];

module.exports = { createStudentValidator, updateStudentValidator, assignRoomValidator, handleValidationErrors };
