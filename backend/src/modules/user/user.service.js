const prisma = require("../../lib/prisma");
const authService = require("../auth/auth.service");

const listUsers = async ({ page = 1, limit = 20, search = "", role = "" }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const where = {
    ...(role ? { role } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { student: { is: { rollNo: { contains: search, mode: "insensitive" } } } },
      ],
    } : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            rollNo: true,
            course: true,
            year: true,
            phone: true,
            room: { select: { id: true, roomNo: true, floor: true } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page: pageNum, limit: limitNum };
};

const createUser = async (data) => {
  const { user } = await authService.registerUser(data);
  return user;
};

module.exports = { listUsers, createUser };
