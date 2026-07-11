/**
 * src/modules/mess/mess.service.js — Mess Business Logic
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");

const DAYS_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEAL_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

/**
 * Get full weekly menu, organized as a structured schedule
 */
const getWeeklyMenu = async () => {
  const menus = await prisma.messMenu.findMany({
    orderBy: [{ day: "asc" }, { mealType: "asc" }],
    select: { id: true, day: true, mealType: true, items: true, description: true },
  });

  // Organize into { MONDAY: { BREAKFAST: [...], LUNCH: [...] }, ... }
  const organized = {};
  for (const day of DAYS_ORDER) {
    organized[day] = {};
    for (const meal of MEAL_ORDER) {
      const entry = menus.find((m) => m.day === day && m.mealType === meal);
      organized[day][meal] = entry || null;
    }
  }

  return organized;
};

const getMenuById = async (id) => {
  const menu = await prisma.messMenu.findUnique({
    where: { id },
    include: { _count: { select: { feedbacks: true } } },
  });
  if (!menu) throw new AppError("Menu not found.", 404);
  return menu;
};

const createMenuItem = async ({ day, mealType, items, description }) => {
  // Check for existing slot
  const existing = await prisma.messMenu.findUnique({ where: { day_mealType: { day, mealType } } });
  if (existing) {
    throw new AppError(`A menu already exists for ${day} ${mealType}. Use PUT to update it.`, 409);
  }

  return await prisma.messMenu.create({
    data: { day, mealType, items, description },
  });
};

const updateMenuItem = async (id, { items, description }) => {
  const menu = await prisma.messMenu.findUnique({ where: { id } });
  if (!menu) throw new AppError("Menu not found.", 404);

  return await prisma.messMenu.update({
    where: { id },
    data: { ...(items && { items }), ...(description !== undefined && { description }) },
  });
};

const deleteMenuItem = async (id) => {
  const menu = await prisma.messMenu.findUnique({ where: { id } });
  if (!menu) throw new AppError("Menu not found.", 404);
  await prisma.messMenu.delete({ where: { id } });
};

const submitFeedback = async ({ messMenuId, rating, comment }, userId) => {
  const menu = await prisma.messMenu.findUnique({ where: { id: messMenuId } });
  if (!menu) throw new AppError("Menu not found.", 404);

  return await prisma.messFeedback.create({
    data: { messMenuId, rating: parseInt(rating, 10), comment, userId },
    select: {
      id: true,
      rating: true,
      comment: true,
      date: true,
      user: { select: { id: true, name: true } },
      messMenu: { select: { day: true, mealType: true } },
    },
  });
};

const getFeedbacks = async ({ page = 1, limit = 10, messMenuId }) => {
  const skip = (page - 1) * limit;
  const where = messMenuId ? { messMenuId } : {};

  const [feedbacks, total] = await Promise.all([
    prisma.messFeedback.findMany({
      where,
      skip,
      take: parseInt(limit, 10),
      orderBy: { date: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        date: true,
        user: { select: { id: true, name: true } },
        messMenu: { select: { id: true, day: true, mealType: true } },
      },
    }),
    prisma.messFeedback.count({ where }),
  ]);

  // Calculate average rating
  const avgResult = await prisma.messFeedback.aggregate({
    where,
    _avg: { rating: true },
  });

  return { feedbacks, total, averageRating: avgResult._avg.rating || 0 };
};

module.exports = { getWeeklyMenu, getMenuById, createMenuItem, updateMenuItem, deleteMenuItem, submitFeedback, getFeedbacks };
