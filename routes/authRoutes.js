const express = require("express");
const router = express.Router();

/**
 * @module AuthRoutes
 * @description Publicly accessible endpoints for operative authentication and credential recovery.
 */

const {
  registerUser,
  loginUser,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

module.exports = router;
