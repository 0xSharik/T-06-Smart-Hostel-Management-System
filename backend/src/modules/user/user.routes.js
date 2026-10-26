const express = require("express");
const { query } = require("express-validator");
const { protect, authorize } = require("../../middleware/auth.middleware");
const { registerValidator, handleValidationErrors } = require("../auth/auth.validator");
const userController = require("./user.controller");

const router = express.Router();
router.use(protect, authorize("ADMIN"));

router.get(
  "/",
  query("role").optional().isIn(["ADMIN", "WARDEN", "STUDENT"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  userController.listUsers
);
router.post("/", registerValidator, userController.createUser);

module.exports = router;
