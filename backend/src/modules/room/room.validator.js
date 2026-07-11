/**
 * src/modules/room/room.validator.js
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, "Validation failed", 422, errors.array());
  next();
};

const createRoomValidator = [
  body("roomNo").trim().notEmpty().withMessage("Room number is required"),
  body("floor").notEmpty().withMessage("Floor is required").isInt({ min: 0 }).withMessage("Floor must be a non-negative integer"),
  body("type").optional().isIn(["SINGLE", "DOUBLE", "TRIPLE"]).withMessage("Type must be SINGLE, DOUBLE, or TRIPLE"),
  body("capacity").optional().isInt({ min: 1, max: 10 }).withMessage("Capacity must be between 1 and 10"),
  body("amenities").optional().isArray().withMessage("Amenities must be an array"),
  handleValidationErrors,
];

const updateRoomValidator = [
  body("floor").optional().isInt({ min: 0 }).withMessage("Floor must be a non-negative integer"),
  body("type").optional().isIn(["SINGLE", "DOUBLE", "TRIPLE"]).withMessage("Invalid room type"),
  body("capacity").optional().isInt({ min: 1, max: 10 }).withMessage("Capacity must be 1–10"),
  body("status").optional().isIn(["AVAILABLE", "OCCUPIED", "FULL", "MAINTENANCE"]).withMessage("Invalid status"),
  body("amenities").optional().isArray().withMessage("Amenities must be an array"),
  handleValidationErrors,
];

module.exports = { createRoomValidator, updateRoomValidator };
