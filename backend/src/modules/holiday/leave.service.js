/**
 * src/modules/holiday/leave.service.js — Student Holiday Leave Checkout Workflow
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const createLeaveRequest = async ({ reason, fromDate, toDate }, userId) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new AppError("Student profile not found.", 404);

  return await prisma.leaveRequest.create({
    data: {
      reason,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      studentId: student.id,
      status: "PENDING",
    },
    include: {
      student: { select: { rollNo: true, user: { select: { name: true } }, room: { select: { roomNo: true } } } },
    },
  });
};

const getLeaveRequests = async ({ userId, role, status }) => {
  const where = {
    ...(status ? { status } : {}),
  };

  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return [];
    where.studentId = student.id;
  }

  return await prisma.leaveRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { rollNo: true, user: { select: { name: true } }, room: { select: { roomNo: true } } } },
    },
  });
};

const updateLeaveStatus = async (id, status) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new AppError("Leave request not found.", 404);

  return await prisma.leaveRequest.update({
    where: { id },
    data: { status },
    include: {
      student: { select: { rollNo: true, user: { select: { name: true } } } },
    },
  });
};

const confirmLeaveReturn = async (id, userId, role) => {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!leave) throw new AppError("Leave request not found.", 404);

  if (role === "STUDENT" && leave.student.userId !== userId) {
    throw new AppError("Not authorized.", 403);
  }

  return await prisma.leaveRequest.update({
    where: { id },
    data: { returnConfirmed: true },
  });
};

module.exports = { createLeaveRequest, getLeaveRequests, updateLeaveStatus, confirmLeaveReturn };
