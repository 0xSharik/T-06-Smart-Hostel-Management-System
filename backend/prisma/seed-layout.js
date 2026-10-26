const TOTAL_FLOORS = 10;
const ROOMS_PER_FLOOR = 10;
const DEMO_STUDENTS = 200;
const ROOM_CAPACITY = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4, QUINT: 5 };

const getRoomType = (roomSlot) => {
  if (roomSlot <= 4) return "QUINT";
  if (roomSlot <= 7) return "QUAD";
  if (roomSlot === 8) return "TRIPLE";
  if (roomSlot === 9) return "DOUBLE";
  return "SINGLE";
};

const getRoomNo = (floor, roomSlot) => `${floor}${String(roomSlot).padStart(2, "0")}`;
const getCapacity = (type) => ROOM_CAPACITY[type];
const getReservedRoomNos = () => Array.from({ length: TOTAL_FLOORS }, (_, i) => getRoomNo(i + 1, 10));
const getMaintenanceRoomNos = () => Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1)
  .filter((floor) => floor % 2 === 1)
  .map((floor) => getRoomNo(floor, 9));

module.exports = {
  TOTAL_FLOORS,
  ROOMS_PER_FLOOR,
  DEMO_STUDENTS,
  ROOM_CAPACITY,
  getRoomType,
  getRoomNo,
  getCapacity,
  getReservedRoomNos,
  getMaintenanceRoomNos,
};
