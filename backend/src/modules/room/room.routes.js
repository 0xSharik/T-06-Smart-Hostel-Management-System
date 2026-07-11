/**
 * src/modules/room/room.routes.js
 */

const express = require("express");
const router = express.Router();
const roomController = require("./room.controller");
const { createRoomValidator, updateRoomValidator } = require("./room.validator");
const { protect, authorize } = require("../../middleware/auth.middleware");

router.use(protect);

router.get("/", roomController.getAllRooms);
router.get("/stats", roomController.getRoomStats);
router.get("/:id", roomController.getRoomById);

router.post("/", authorize("ADMIN", "WARDEN"), createRoomValidator, roomController.createRoom);
router.put("/:id", authorize("ADMIN", "WARDEN"), updateRoomValidator, roomController.updateRoom);
router.delete("/:id", authorize("ADMIN"), roomController.deleteRoom);

module.exports = router;
