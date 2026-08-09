/**
 * src/modules/notification/notification.service.js — Notification Business Logic
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const NOTIF_SELECT = {
  id: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  targetRole: true,
  createdAt: true,
};

/**
 * Get all notifications for the authenticated user
 */
const getMyNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const skip = (page - 1) * limit;
  const where = {
    userId,
    ...(unreadOnly === "true" ? { isRead: false } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: parseInt(limit, 10), select: NOTIF_SELECT, orderBy: { createdAt: "desc" } }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, unreadCount };
};

/**
 * Create a notification for a specific user
 */
const createNotification = async ({ title, message, type = "GENERAL", userId }) => {
  // Ensure target user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("Target user not found.", 404);

  return await prisma.notification.create({
    data: { title, message, type, userId },
    select: NOTIF_SELECT,
  });
};

/**
 * Broadcast notification to all users of a specific role
 */
const broadcastNotification = async ({ title, message, type = "GENERAL", targetRole }) => {
  const users = await prisma.user.findMany({
    where: { role: targetRole },
    select: { id: true },
  });

  if (users.length === 0) {
    throw new AppError(`No users found with role: ${targetRole}`, 404);
  }

  // Use createMany for efficiency
  await prisma.notification.createMany({
    data: users.map((user) => ({
      title,
      message,
      type,
      targetRole,
      userId: user.id,
    })),
  });

  return { sentTo: users.length, role: targetRole };
};

/**
 * Mark a notification as read
 */
const markAsRead = async (id, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new AppError("Notification not found.", 404);

  // Users can only mark their own notifications
  if (notification.userId !== userId) {
    throw new AppError("Not authorized to update this notification.", 403);
  }

  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: NOTIF_SELECT,
  });
};

/**
 * Mark ALL notifications for current user as read
 */
const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updated: result.count };
};

/**
 * Delete a notification
 */
const deleteNotification = async (id, userId, role) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new AppError("Notification not found.", 404);

  // Only admin or notification owner can delete
  if (role !== "ADMIN" && notification.userId !== userId) {
    throw new AppError("Not authorized to delete this notification.", 403);
  }

  await prisma.notification.delete({ where: { id } });
};

module.exports = { getMyNotifications, createNotification, broadcastNotification, markAsRead, markAllAsRead, deleteNotification };
