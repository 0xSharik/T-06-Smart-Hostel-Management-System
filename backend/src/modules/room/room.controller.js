/**
 * src/modules/room/room.controller.js
 */

const roomService = require("./room.service");
const { sendSuccess, sendPaginated } = require("../../utils/response");

const getAllRooms = async (req, res) => {
  const { page = 1, limit = 20, floor, type, status } = req.query;
  const { rooms, total } = await roomService.getAllRooms({ page, limit, floor, type, status });
  return sendPaginated(res, rooms, total, page, limit, "Rooms fetched successfully.");
};

const getRoomById = async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  return sendSuccess(res, room, "Room fetched successfully.");
};

const createRoom = async (req, res) => {
  const room = await roomService.createRoom(req.body);
  return sendSuccess(res, room, "Room created successfully.", 201);
};

const updateRoom = async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body);
  return sendSuccess(res, room, "Room updated successfully.");
};

const deleteRoom = async (req, res) => {
  await roomService.deleteRoom(req.params.id);
  return sendSuccess(res, null, "Room deleted successfully.");
};

const getRoomStats = async (req, res) => {
  const stats = await roomService.getRoomStats();
  return sendSuccess(res, stats, "Room statistics fetched successfully.");
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomStats };
