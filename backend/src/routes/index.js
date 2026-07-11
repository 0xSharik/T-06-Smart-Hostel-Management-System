/**
 * src/routes/index.js — Central Route Aggregator
 *
 * Responsibilities:
 *  - Import all module routers
 *  - Mount them at their respective API paths
 *  - This is the ONLY place where modules are connected to the Express app
 *
 * Adding a new module:
 *  1. Create your module folder under src/modules/
 *  2. Import its router here
 *  3. Mount it with router.use()
 *  Done — no other file needs to change.
 */

const express = require("express");
const router = express.Router();

// ── Module Routers ─────────────────────────────────────────────────────────────
const authRoutes = require("../modules/auth/auth.routes");
const studentRoutes = require("../modules/student/student.routes");
const roomRoutes = require("../modules/room/room.routes");
const visitorRoutes = require("../modules/visitor/visitor.routes");
const maintenanceRoutes = require("../modules/maintenance/maintenance.routes");
const messRoutes = require("../modules/mess/mess.routes");
const holidayRoutes = require("../modules/holiday/holiday.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const notificationRoutes = require("../modules/notification/notification.routes");

// ── Mount Routes ───────────────────────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/rooms", roomRoutes);
router.use("/visitors", visitorRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/mess", messRoutes);
router.use("/holidays", holidayRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);

// ── API Health Check ───────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Hostel Management API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;
