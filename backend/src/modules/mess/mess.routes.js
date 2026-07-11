/**
 * src/modules/mess/mess.routes.js
 */

const express = require("express");
const router = express.Router();
const messController = require("./mess.controller");
const { createMenuValidator, updateMenuValidator, feedbackValidator } = require("./mess.validator");
const { protect, authorize } = require("../../middleware/auth.middleware");

router.use(protect);

// Menu
router.get("/menu", messController.getWeeklyMenu);
router.get("/menu/:id", messController.getMenuById);
router.post("/menu", authorize("ADMIN", "WARDEN"), createMenuValidator, messController.createMenuItem);
router.put("/menu/:id", authorize("ADMIN", "WARDEN"), updateMenuValidator, messController.updateMenuItem);
router.delete("/menu/:id", authorize("ADMIN", "WARDEN"), messController.deleteMenuItem);

// Feedback
router.get("/feedback", messController.getFeedbacks);
router.post("/feedback", feedbackValidator, messController.submitFeedback);

module.exports = router;
