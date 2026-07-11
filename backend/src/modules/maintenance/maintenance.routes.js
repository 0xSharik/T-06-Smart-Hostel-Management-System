/**
 * src/modules/maintenance/maintenance.routes.js
 */

const express = require("express");
const router = express.Router();
const maintenanceController = require("./maintenance.controller");
const { createMaintenanceValidator, updateStatusValidator } = require("./maintenance.validator");
const { protect, authorize } = require("../../middleware/auth.middleware");

router.use(protect);

router.get("/", maintenanceController.getAllRequests);
router.get("/stats", authorize("ADMIN", "WARDEN"), maintenanceController.getStats);
router.get("/:id", maintenanceController.getRequestById);

// Any authenticated user can raise a request
router.post("/", createMaintenanceValidator, maintenanceController.createRequest);
router.put("/:id", maintenanceController.updateRequest);
router.patch("/:id/status", authorize("ADMIN", "WARDEN"), updateStatusValidator, maintenanceController.updateStatus);
router.delete("/:id", maintenanceController.deleteRequest);

module.exports = router;
