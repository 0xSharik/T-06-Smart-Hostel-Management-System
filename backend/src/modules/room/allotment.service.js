/**
 * src/modules/room/allotment.service.js — Automated Room Allotment Engine
 *
 * Greedy scoring algorithm matching student preferences (floor, type, course batch) against availability.
 */

const prisma = require("../../lib/prisma");
const { AppError } = require("../../middleware/error.middleware");
const { getOccupancyStatus, scoreRoom } = require("./room.rules");

/**
 * Score & rank available rooms for a student based on preferences
 */
const runAllotmentEngine = async ({ preferredFloor, preferredType, studentId }) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { name: true } } },
  });
  if (!student) throw new AppError("Student profile not found.", 404);

  // Get all rooms that are AVAILABLE or partially occupied
  const availableRooms = await prisma.room.findMany({
    where: {
      status: { in: ["AVAILABLE", "OCCUPIED"] },
    },
    include: {
      students: {
        select: { course: true, year: true },
      },
    },
  });

  const scoredRooms = availableRooms
    .map((room) => scoreRoom(room, student, { preferredFloor, preferredType }))
    .filter(Boolean);

  // Sort by highest score
  scoredRooms.sort((a, b) => b.score - a.score);

  return {
    student,
    topRecommendations: scoredRooms.slice(0, 5),
    totalEvaluated: availableRooms.length,
  };
};

/**
 * Auto-assign best-ranked room to student
 */
const autoAllotRoom = async (studentId, preferredFloor, preferredType) => {
  const { topRecommendations } = await runAllotmentEngine({ studentId, preferredFloor, preferredType });

  if (topRecommendations.length === 0) {
    throw new AppError("No available rooms match criteria.", 404);
  }

  const bestRoom = topRecommendations[0].room;
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError("Student profile not found.", 404);

  const operations = [];

  if (student.roomId && student.roomId !== bestRoom.id) {
    const currentRoom = await prisma.room.findUnique({ where: { id: student.roomId } });
    const nextOccupancy = Math.max((currentRoom?.occupancy || 1) - 1, 0);
    operations.push(prisma.room.update({
      where: { id: student.roomId },
      data: {
        occupancy: nextOccupancy,
        status: currentRoom?.status === "MAINTENANCE" ? "MAINTENANCE" : getOccupancyStatus(nextOccupancy, currentRoom?.capacity || 1),
      },
    }));
  }

  const nextBestOccupancy = student.roomId === bestRoom.id ? bestRoom.occupancy : bestRoom.occupancy + 1;

  operations.push(prisma.student.update({
    where: { id: studentId },
    data: { roomId: bestRoom.id },
  }));

  operations.push(prisma.room.update({
    where: { id: bestRoom.id },
    data: {
      occupancy: nextBestOccupancy,
      status: getOccupancyStatus(nextBestOccupancy, bestRoom.capacity),
    },
  }));

  const results = await prisma.$transaction(operations);
  const updatedRoom = results[results.length - 1];

  return { assignedRoom: updatedRoom };
};

module.exports = { runAllotmentEngine, autoAllotRoom };
