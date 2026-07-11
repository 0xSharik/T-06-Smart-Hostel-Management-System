/**
 * src/modules/maintenance/maintenance.service.js — Maintenance Business Logic
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const MAINTENANCE_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  status: true,
  priority: true,
  remarks: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
  room: { select: { id: true, roomNo: true, floor: true } },
};

const getAllRequests = async ({ page = 1, limit = 10, status, priority, category, userId, role }) => {
  const skip = (page - 1) * limit;

  // Students can only see their own requests
  const where = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(category ? { category } : {}),
    ...(role === "STUDENT" ? { userId } : {}),
  };

  const [requests, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({ where, skip, take: parseInt(limit, 10), select: MAINTENANCE_SELECT, orderBy: { createdAt: "desc" } }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  return { requests, total };
};

const getRequestById = async (id, userId, role) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id }, select: MAINTENANCE_SELECT });
  if (!request) throw new AppError("Maintenance request not found.", 404);

  // Students can only view their own requests
  if (role === "STUDENT" && request.user.id !== userId) {
    throw new AppError("You are not authorized to view this request.", 403);
  }

  return request;
};

const createRequest = async ({ title, description, category = "OTHER", priority = "MEDIUM", roomId }, userId) => {
  return await prisma.maintenanceRequest.create({
    data: { title, description, category, priority, roomId, userId, status: "PENDING" },
    select: MAINTENANCE_SELECT,
  });
};

const updateRequest = async (id, { title, description, category, priority }, userId, role) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new AppError("Maintenance request not found.", 404);

  // Students can only edit PENDING requests they own
  if (role === "STUDENT") {
    if (request.userId !== userId) throw new AppError("Not authorized.", 403);
    if (request.status !== "PENDING") throw new AppError("Cannot edit a request that is already being processed.", 400);
  }

  return await prisma.maintenanceRequest.update({
    where: { id },
    data: { title, description, category, priority },
    select: MAINTENANCE_SELECT,
  });
};

const updateStatus = async (id, { status, remarks }) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new AppError("Maintenance request not found.", 404);

  const resolvedAt = status === "RESOLVED" ? new Date() : request.resolvedAt;

  return await prisma.maintenanceRequest.update({
    where: { id },
    data: { status, remarks, resolvedAt },
    select: MAINTENANCE_SELECT,
  });
};

const deleteRequest = async (id, userId, role) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new AppError("Maintenance request not found.", 404);

  if (role === "STUDENT" && request.userId !== userId) {
    throw new AppError("Not authorized to delete this request.", 403);
  }

  await prisma.maintenanceRequest.delete({ where: { id } });
};

const getStats = async () => {
  const [pending, inProgress, resolved, rejected] = await Promise.all([
    prisma.maintenanceRequest.count({ where: { status: "PENDING" } }),
    prisma.maintenanceRequest.count({ where: { status: "IN_PROGRESS" } }),
    prisma.maintenanceRequest.count({ where: { status: "RESOLVED" } }),
    prisma.maintenanceRequest.count({ where: { status: "REJECTED" } }),
  ]);
  return { pending, inProgress, resolved, rejected, total: pending + inProgress + resolved + rejected };
};

module.exports = { getAllRequests, getRequestById, createRequest, updateRequest, updateStatus, deleteRequest, getStats };
