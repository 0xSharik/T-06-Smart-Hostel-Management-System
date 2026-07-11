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
router.patch("/:id/exit", authorize("ADMIN", "WARDEN"), visitorController.logVisitorExit);

module.exports = router;
