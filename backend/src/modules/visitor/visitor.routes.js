/**
 * src/modules/visitor/visitor.routes.js
 */

const express = require("express");
const router = express.Router();
const visitorController = require("./visitor.controller");
const { logVisitorValidator } = require("./visitor.validator");
const { protect, authorize } = require("../../middleware/auth.middleware");

router.use(protect);

router.get("/", authorize("ADMIN", "WARDEN"), visitorController.getAllVisitors);
router.get("/student/:studentId", visitorController.getVisitorsByStudent);
router.post("/", authorize("ADMIN", "WARDEN"), logVisitorValidator, visitorController.logVisitorEntry);
router.post("/generate-qr", authorize("ADMIN", "WARDEN"), visitorController.generateQR);
router.post("/scan-qr", authorize("ADMIN", "WARDEN"), visitorController.scanQR);
router.patch("/:id/exit", authorize("ADMIN", "WARDEN"), visitorController.logVisitorExit);

module.exports = router;
