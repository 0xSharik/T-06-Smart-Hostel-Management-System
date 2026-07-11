/**
 * src/modules/student/student.service.js — Student Business Logic
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const STUDENT_SELECT = {
  id: true,
  rollNo: true,
  course: true,
  year: true,
  phone: true,
  parentName: true,
  parentPhone: true,
  address: true,
  admissionDate: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, role: true } },
  room: { select: { id: true, roomNo: true, floor: true, type: true } },
};

/**
 * Get all students (paginated + searchable)
 */
const getAllStudents = async ({ page = 1, limit = 10, search = "", course = "", year = "" }) => {
  const skip = (page - 1) * limit;
  const where = {
    AND: [
      search
        ? {
            OR: [
              { rollNo: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {},
      course ? { course: { contains: course, mode: "insensitive" } } : {},
      year ? { year: parseInt(year, 10) } : {},
    ],
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({ where, skip, take: parseInt(limit, 10), select: STUDENT_SELECT, orderBy: { createdAt: "desc" } }),
    prisma.student.count({ where }),
  ]);

  return { students, total };
};

/**
 * Get single student by ID
 */
const getStudentById = async (id) => {
  const student = await prisma.student.findUnique({ where: { id }, select: STUDENT_SELECT });
  if (!student) throw new AppError("Student not found.", 404);
  return student;
};

/**
 * Create a student profile for an existing user
 */
const createStudent = async ({ userId, rollNo, course, year, phone, parentName, parentPhone, address }) => {
  // Ensure user exists and is a STUDENT
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user) throw new AppError("User not found.", 404);
  if (user.role !== "STUDENT") throw new AppError("Only users with STUDENT role can have a student profile.", 400);

  // Check for duplicate rollNo
  const existing = await prisma.student.findUnique({ where: { rollNo } });
  if (existing) throw new AppError(`Roll number ${rollNo} is already registered.`, 409);

  // Check if user already has a student profile
  const existingProfile = await prisma.student.findUnique({ where: { userId } });
  if (existingProfile) throw new AppError("This user already has a student profile.", 409);

  return await prisma.student.create({
    data: { userId, rollNo, course, year: parseInt(year, 10), phone, parentName, parentPhone, address },
    select: STUDENT_SELECT,
  });
};

/**
 * Update student profile
 */
const updateStudent = async (id, data) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new AppError("Student not found.", 404);

  if (data.year) data.year = parseInt(data.year, 10);

  return await prisma.student.update({ where: { id }, data, select: STUDENT_SELECT });
};

/**
 * Delete student profile (cascade deletes via Prisma schema)
 */
const deleteStudent = async (id) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new AppError("Student not found.", 404);

  // Free up room occupancy if assigned
  if (student.roomId) {
    await prisma.room.update({
      where: { id: student.roomId },
      data: { occupancy: { decrement: 1 } },
    });
  }

  await prisma.student.delete({ where: { id } });
};

/**
 * Assign a student to a room
 */
const assignRoom = async (studentId, roomId) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError("Student not found.", 404);

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError("Room not found.", 404);
  if (room.status === "MAINTENANCE") throw new AppError("Room is under maintenance and cannot be assigned.", 400);
  if (room.occupancy >= room.capacity) throw new AppError("Room is full.", 400);

  // Unassign from current room if assigned
  if (student.roomId && student.roomId !== roomId) {
    await prisma.room.update({
      where: { id: student.roomId },
      data: { occupancy: { decrement: 1 } },
    });
  }

  const newOccupancy = student.roomId === roomId ? room.occupancy : room.occupancy + 1;

  const [updatedStudent] = await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { roomId }, select: STUDENT_SELECT }),
    prisma.room.update({
      where: { id: roomId },
      data: {
        occupancy: newOccupancy,
        status: newOccupancy >= room.capacity ? "FULL" : "OCCUPIED",
      },
    }),
  ]);

  return updatedStudent;
};

/**
 * Unassign a student from their room
 */
const unassignRoom = async (studentId) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError("Student not found.", 404);
  if (!student.roomId) throw new AppError("Student is not assigned to any room.", 400);

  const [updatedStudent] = await prisma.$transaction([
    prisma.student.update({ where: { id: studentId }, data: { roomId: null }, select: STUDENT_SELECT }),
    prisma.room.update({
      where: { id: student.roomId },
      data: {
        occupancy: { decrement: 1 },
        status: "AVAILABLE",
      },
    }),
  ]);

  return updatedStudent;
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, assignRoom, unassignRoom };
