/**
 * src/modules/visitor/visitor.service.js — Visitor Business Logic
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const VISITOR_SELECT = {
  id: true,
  name: true,
  phone: true,
  relation: true,
  purpose: true,
  inTime: true,
  outTime: true,
  date: true,
  createdAt: true,
  student: {
    select: {
      id: true,
      rollNo: true,
      user: { select: { name: true } },
      room: { select: { roomNo: true } },
    },
  },
  loggedBy: { select: { id: true, name: true } },
};

const getAllVisitors = async ({ page = 1, limit = 10, date, studentId }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(studentId ? { studentId } : {}),
    ...(date ? { date: new Date(date) } : {}),
  };

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({ where, skip, take: parseInt(limit, 10), select: VISITOR_SELECT, orderBy: { inTime: "desc" } }),
    prisma.visitor.count({ where }),
  ]);

  return { visitors, total };
};

const getVisitorsByStudent = async (studentId, { page = 1, limit = 10 }) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError("Student not found.", 404);

  const skip = (page - 1) * limit;
  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({ where: { studentId }, skip, take: parseInt(limit, 10), select: VISITOR_SELECT, orderBy: { inTime: "desc" } }),
    prisma.visitor.count({ where: { studentId } }),
  ]);

  return { visitors, total };
};

const logVisitorEntry = async ({ studentId, name, phone, relation, purpose }, loggedById) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError("Student not found.", 404);

  return await prisma.visitor.create({
    data: { studentId, name, phone, relation, purpose, loggedById },
    select: VISITOR_SELECT,
  });
};

const logVisitorExit = async (id) => {
  const visitor = await prisma.visitor.findUnique({ where: { id } });
  if (!visitor) throw new AppError("Visitor record not found.", 404);
  if (visitor.outTime) throw new AppError("Exit time already recorded for this visitor.", 400);

  return await prisma.visitor.update({
    where: { id },
    data: { outTime: new Date() },
    select: VISITOR_SELECT,
  });
};

const getTodayVisitorCount = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return await prisma.visitor.count({
    where: { inTime: { gte: today } },
  });
};

module.exports = { getAllVisitors, getVisitorsByStudent, logVisitorEntry, logVisitorExit, getTodayVisitorCount };
