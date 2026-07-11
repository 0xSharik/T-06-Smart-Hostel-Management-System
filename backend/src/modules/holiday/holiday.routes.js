/**
 * src/modules/holiday/holiday.routes.js
 */

const express = require("express");
const router = express.Router();
const holidayController = require("./holiday.controller");
const { createHolidayValidator, updateHolidayValidator } = require("./holiday.validator");
const { protect, authorize } = require("../../middleware/auth.middleware");

router.use(protect);

router.get("/", holidayController.getAllHolidays);
router.get("/upcoming", holidayController.getUpcomingHolidays);
router.get("/:id", holidayController.getHolidayById);

router.post("/", authorize("ADMIN", "WARDEN"), createHolidayValidator, holidayController.createHoliday);
router.put("/:id", authorize("ADMIN", "WARDEN"), updateHolidayValidator, holidayController.updateHoliday);
router.delete("/:id", authorize("ADMIN"), holidayController.deleteHoliday);

module.exports = router;
