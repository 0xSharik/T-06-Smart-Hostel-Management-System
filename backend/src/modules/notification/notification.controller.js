/**
 * src/modules/notification/notification.controller.js
 */

const notificationService = require("./notification.service");
const { sendSuccess, sendPaginated } = require("../../utils/response");

const getMyNotifications = async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = "false" } = req.query;
  const { notifications, total, unreadCount } = await notificationService.getMyNotifications(req.user.id, { page, limit, unreadOnly });
  const result = sendPaginated(res, { notifications, unreadCount }, total, page, limit, "Notifications fetched.");
  return result;
};

const createNotification = async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  return sendSuccess(res, notification, "Notification sent.", 201);
};

const broadcastNotification = async (req, res) => {
  const result = await notificationService.broadcastNotification(req.body);
  return sendSuccess(res, result, `Notification broadcast to ${result.sentTo} users.`, 201);
};

const markAsRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  return sendSuccess(res, notification, "Notification marked as read.");
};

const markAllAsRead = async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return sendSuccess(res, result, `${result.updated} notifications marked as read.`);
};

const deleteNotification = async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id, req.user.role);
  return sendSuccess(res, null, "Notification deleted.");
};

module.exports = { getMyNotifications, createNotification, broadcastNotification, markAsRead, markAllAsRead, deleteNotification };
