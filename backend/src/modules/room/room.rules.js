const getOccupancyStatus = (occupancy, capacity) => {
  if (occupancy <= 0) return "AVAILABLE";
  return occupancy >= capacity ? "FULL" : "OCCUPIED";
};

const scoreRoom = (room, student, { preferredFloor, preferredType } = {}) => {
  const remainingBeds = room.capacity - room.occupancy;
  if (remainingBeds <= 0 || room.status === "MAINTENANCE") return null;

  let score = 0;
  if (preferredFloor !== undefined && room.floor === parseInt(preferredFloor, 10)) score += 30;
  if (preferredType && room.type === preferredType) score += 20;
  if ((room.students || []).some((roommate) => roommate.course === student.course)) score += 15;
  score += remainingBeds * 10;

  return {
    room,
    score,
    matchPercentage: Math.min(100, Math.round((score / 75) * 100)),
    remainingBeds,
  };
};

module.exports = { getOccupancyStatus, scoreRoom };
