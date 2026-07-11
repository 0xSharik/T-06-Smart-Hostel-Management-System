/**
 * src/modules/holiday/holiday.service.js — Holiday Business Logic
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const getAllHolidays = async ({ year, type } = {}) => {
  const where = {};

  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    where.date = { gte: startDate, lte: endDate };
  }

  if (type) {
    where.type = type;
  }

  return await prisma.holiday.findMany({
    where,
    orderBy: { date: "asc" },
  });
};

const getUpcomingHolidays = async (limit = 5) => {
  return await prisma.holiday.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: parseInt(limit, 10),
  });
};

const getHolidayById = async (id) => {
  const holiday = await prisma.holiday.findUnique({ where: { id } });
  if (!holiday) throw new AppError("Holiday not found.", 404);
  return holiday;
};

const createHoliday = async ({ title, date, type = "PUBLIC", description }) => {
  return await prisma.holiday.create({
    data: { title, date: new Date(date), type, description },
  });
};

const updateHoliday = async (id, { title, date, type, description }) => {
  const holiday = await prisma.holiday.findUnique({ where: { id } });
  if (!holiday) throw new AppError("Holiday not found.", 404);

  return await prisma.holiday.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(date && { date: new Date(date) }),
      ...(type && { type }),
      ...(description !== undefined && { description }),
    },
  });
};

const deleteHoliday = async (id) => {
  const holiday = await prisma.holiday.findUnique({ where: { id } });
  if (!holiday) throw new AppError("Holiday not found.", 404);
  await prisma.holiday.delete({ where: { id } });
};

module.exports = { getAllHolidays, getUpcomingHolidays, getHolidayById, createHoliday, updateHoliday, deleteHoliday };
