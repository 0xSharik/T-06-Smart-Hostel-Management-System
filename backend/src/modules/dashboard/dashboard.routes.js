/**
 * src/modules/dashboard/dashboard.routes.js
 */

const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");
const { protect, authorize } = require("../../middleware/auth.middleware");

router.use(protect);

// All dashboard routes are for Admin/Warden only
router.get("/stats", authorize("ADMIN", "WARDEN"), dashboardController.getStats);
router.get("/occupancy-by-floor", authorize("ADMIN", "WARDEN"), dashboardController.getOccupancyByFloor);
router.get("/maintenance-by-status", authorize("ADMIN", "WARDEN"), dashboardController.getMaintenanceByStatus);

module.exports = router;
