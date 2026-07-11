/**
 * src/modules/notification/notification.validator.js
 */

const { body, validationResult } = require("express-validator");
const { sendError } = require("../../utils/response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, "Validation failed", 422, errors.array());
  next();
};

const NOTIF_TYPES = ["INFO", "WARNING", "ALERT", "MAINTENANCE", "MESS", "HOLIDAY", "GENERAL"];
const ROLES = ["ADMIN", "WARDEN", "STUDENT"];

const createNotificationValidator = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("type").optional().isIn(NOTIF_TYPES).withMessage(`Type must be one of: ${NOTIF_TYPES.join(", ")}`),
  body("userId").optional(),
  handleValidationErrors,
];

const broadcastValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("type").optional().isIn(NOTIF_TYPES),
  body("targetRole")
    .notEmpty().withMessage("Target role is required for broadcast")
    .isIn(ROLES).withMessage(`Target role must be one of: ${ROLES.join(", ")}`),
  handleValidationErrors,
];

module.exports = { createNotificationValidator, broadcastValidator };
