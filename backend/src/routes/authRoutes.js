const express = require("express");

const router = express.Router();

// =====================================================
// AUTH CONTROLLER
// =====================================================

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  getCurrentUser,
} = require("../controllers/authController");

// =====================================================
// DEBUG
// =====================================================

console.log("=================================");
console.log("AUTH ROUTES FILE LOADED");
console.log("=================================");

console.log("register:", typeof register);
console.log("login:", typeof login);
console.log("forgotPassword:", typeof forgotPassword);
console.log("verifyOTP:", typeof verifyOTP);
console.log("resetPassword:", typeof resetPassword);
console.log("changePassword:", typeof changePassword);
console.log("getCurrentUser:", typeof getCurrentUser);

console.log("=================================");

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

router.post("/register", register);

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post("/login", login);

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =====================================================

router.post(
  "/forgot-password",
  forgotPassword
);

// =====================================================
// VERIFY OTP
// POST /api/auth/verify-otp
// =====================================================

router.post(
  "/verify-otp",
  verifyOTP
);

// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================

router.post(
  "/reset-password",
  resetPassword
);

// =====================================================
// CHANGE PASSWORD
// PUT /api/auth/change-password/:userId
// =====================================================

router.put(
  "/change-password/:userId",
  changePassword
);

// =====================================================
// CURRENT USER
// GET /api/auth/me/:id
// =====================================================

router.get(
  "/me/:id",
  getCurrentUser
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;