/**
 * src/modules/student/student.routes.js — Student Routes
 */

const express = require("express");
const router = express.Router();
const studentController = require("./student.controller");
const { createStudentValidator, updateStudentValidator, assignRoomValidator } = require("./student.validator");
const { protect, authorize } = require("../../middleware/auth.middleware");

// All routes require authentication
router.use(protect);

router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);

// Admin/Warden only
router.post("/", authorize("ADMIN", "WARDEN"), createStudentValidator, studentController.createStudent);
router.put("/:id", authorize("ADMIN", "WARDEN"), updateStudentValidator, studentController.updateStudent);
router.delete("/:id", authorize("ADMIN"), studentController.deleteStudent);
router.post("/:id/assign-room", authorize("ADMIN", "WARDEN"), assignRoomValidator, studentController.assignRoom);
router.post("/:id/unassign-room", authorize("ADMIN", "WARDEN"), studentController.unassignRoom);

module.exports = router;
