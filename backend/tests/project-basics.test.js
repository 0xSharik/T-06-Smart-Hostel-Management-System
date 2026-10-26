const test = require("node:test");
const assert = require("node:assert/strict");
const seed = require("../prisma/seed-layout");
const { getOccupancyStatus, scoreRoom } = require("../src/modules/room/room.rules");
const prisma = require("../src/lib/prisma");
const userService = require("../src/modules/user/user.service");

test("demo seed layout matches the 100-room and 200-student deliverable", () => {
  const rooms = [];
  for (let floor = 1; floor <= seed.TOTAL_FLOORS; floor += 1) {
    for (let slot = 1; slot <= seed.ROOMS_PER_FLOOR; slot += 1) {
      const type = seed.getRoomType(slot);
      rooms.push({ roomNo: seed.getRoomNo(floor, slot), floor, type, capacity: seed.getCapacity(type) });
    }
  }

  assert.equal(rooms.length, 100);
  assert.equal(seed.DEMO_STUDENTS, 200);
  assert.equal(new Set(rooms.map((room) => room.roomNo)).size, 100);
  assert.equal(rooms.reduce((total, room) => total + room.capacity, 0), 380);
  assert.equal(seed.getReservedRoomNos().length, 10);
  assert.equal(seed.getMaintenanceRoomNos().length, 5);
  assert.equal(rooms.filter((room) => !seed.getReservedRoomNos().includes(room.roomNo)
    && !seed.getMaintenanceRoomNos().includes(room.roomNo))
    .reduce((total, room) => total + room.capacity, 0), 360);
});

test("room allotment favors floor, room type, same-course roommates, and available beds", () => {
  const student = { course: "B.Tech CSE" };
  const exactMatch = scoreRoom({
    id: "preferred", floor: 2, type: "DOUBLE", capacity: 3, occupancy: 1,
    students: [{ course: "B.Tech CSE" }],
  }, student, { preferredFloor: 2, preferredType: "DOUBLE" });
  const fallback = scoreRoom({
    id: "fallback", floor: 4, type: "SINGLE", capacity: 1, occupancy: 0, students: [],
  }, student, { preferredFloor: 2, preferredType: "DOUBLE" });

  assert.equal(exactMatch.score, 85);
  assert.equal(exactMatch.remainingBeds, 2);
  assert.equal(exactMatch.matchPercentage, 100);
  assert.ok(exactMatch.score > fallback.score);
});

test("room allotment excludes full and maintenance rooms", () => {
  const student = { course: "B.Tech CSE" };
  assert.equal(scoreRoom({ capacity: 2, occupancy: 2, status: "FULL" }, student), null);
  assert.equal(scoreRoom({ capacity: 2, occupancy: 0, status: "MAINTENANCE" }, student), null);
});

test("occupancy status reflects available, partial, and full rooms", () => {
  assert.equal(getOccupancyStatus(0, 3), "AVAILABLE");
  assert.equal(getOccupancyStatus(1, 3), "OCCUPIED");
  assert.equal(getOccupancyStatus(3, 3), "FULL");
});

test("admin user directory searches all account roles and returns student details without credentials", async () => {
  const originalFindMany = prisma.user.findMany;
  const originalCount = prisma.user.count;
  let query;
  prisma.user.findMany = async (args) => { query = args; return [{ id: "u1", role: "STUDENT" }]; };
  prisma.user.count = async () => 1;
  try {
    const result = await userService.listUsers({ page: "2", limit: "20", search: "ST2024", role: "STUDENT" });
    assert.equal(result.total, 1);
    assert.equal(result.page, 2);
    assert.equal(result.limit, 20);
    assert.equal(query.skip, 20);
    assert.equal(query.where.role, "STUDENT");
    assert.equal(query.where.OR[2].student.is.rollNo.contains, "ST2024");
    assert.equal(query.select.password, undefined);
    assert.equal(query.select.student.select.room.select.roomNo, true);
  } finally {
    prisma.user.findMany = originalFindMany;
    prisma.user.count = originalCount;
  }
});
