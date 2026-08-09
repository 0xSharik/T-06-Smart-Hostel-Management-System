/**
 * src/modules/room/room.service.js — Room Business Logic
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const ROOM_SELECT = {
  id: true,
  roomNo: true,
  floor: true,
  type: true,
  capacity: true,
  occupancy: true,
  status: true,
  amenities: true,
  createdAt: true,
  _count: { select: { students: true } },
};

const getAllRooms = async ({ page = 1, limit = 20, floor, type, status }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(floor !== undefined ? { floor: parseInt(floor, 10) } : {}),
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
  };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({ where, skip, take: parseInt(limit, 10), select: ROOM_SELECT, orderBy: [{ floor: "asc" }, { roomNo: "asc" }] }),
    prisma.room.count({ where }),
  ]);

  return { rooms, total };
};

const getRoomById = async (id) => {
  const room = await prisma.room.findUnique({
    where: { id },
    select: {
      ...ROOM_SELECT,
      students: {
        select: {
          id: true,
          rollNo: true,
          course: true,
          year: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!room) throw new AppError("Room not found.", 404);
  return room;
};

const createRoom = async ({ roomNo, floor, type = "SINGLE", capacity = 1, amenities = [] }) => {
  const existing = await prisma.room.findUnique({ where: { roomNo } });
  if (existing) throw new AppError(`Room ${roomNo} already exists.`, 409);

  return await prisma.room.create({
    data: { roomNo, floor: parseInt(floor, 10), type, capacity: parseInt(capacity, 10), amenities },
    select: ROOM_SELECT,
  });
};

const updateRoom = async (id, data) => {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new AppError("Room not found.", 404);

  // If reducing capacity, ensure it's not below current occupancy
  if (data.capacity && parseInt(data.capacity, 10) < room.occupancy) {
    throw new AppError(`Cannot reduce capacity below current occupancy (${room.occupancy}).`, 400);
  }

  if (data.floor) data.floor = parseInt(data.floor, 10);
  if (data.capacity) data.capacity = parseInt(data.capacity, 10);

  return await prisma.room.update({ where: { id }, data, select: ROOM_SELECT });
};

const deleteRoom = async (id) => {
  const room = await prisma.room.findUnique({ where: { id }, include: { _count: { select: { students: true } } } });
  if (!room) throw new AppError("Room not found.", 404);
  if (room._count.students > 0) {
    throw new AppError(`Cannot delete room: ${room._count.students} student(s) are assigned to it.`, 400);
  }
  await prisma.room.delete({ where: { id } });
};

const getRoomStats = async () => {
  const [total, available, full, maintenance, occupied] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: "AVAILABLE" } }),
    prisma.room.count({ where: { status: "FULL" } }),
    prisma.room.count({ where: { status: "MAINTENANCE" } }),
    prisma.room.count({ where: { status: "OCCUPIED" } }),
  ]);

  const totalCapacity = await prisma.room.aggregate({ _sum: { capacity: true } });
  const totalOccupancy = await prisma.room.aggregate({ _sum: { occupancy: true } });

  return {
    total,
    available,
    occupied,
    full,
    maintenance,
    totalCapacity: totalCapacity._sum.capacity || 0,
    totalOccupancy: totalOccupancy._sum.occupancy || 0,
    occupancyRate: totalCapacity._sum.capacity
      ? Math.round((totalOccupancy._sum.occupancy / totalCapacity._sum.capacity) * 100)
      : 0,
  };
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomStats };
