/**
 * src/modules/notification/notification.routes.js
 */

const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const { createNotificationValidator, broadcastValidator } = require("./notification.validator");
const { protect, authorize } = require("../../middleware/auth.middleware");

router.use(protect);

// User routes
router.get("/", notificationController.getMyNotifications);
router.patch("/mark-all-read", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

// Admin/Warden only
router.post("/", authorize("ADMIN", "WARDEN"), createNotificationValidator, notificationController.createNotification);
router.post("/broadcast", authorize("ADMIN", "WARDEN"), broadcastValidator, notificationController.broadcastNotification);

module.exports = router;
