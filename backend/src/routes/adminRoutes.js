const express = require("express");

const router = express.Router();

const {
  adminTest,
  getDashboardStats,
  getChartStats,
  getRecentActivities,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdminSettings,
  updateAdminSettings,
} = require("../controllers/adminController");

// =====================================================
// DEBUG
// =====================================================

console.log("=================================");
console.log("ADMIN ROUTES FILE LOADED");
console.log("=================================");

console.log(
  "adminTest:",
  typeof adminTest
);

console.log(
  "getDashboardStats:",
  typeof getDashboardStats
);

console.log(
  "getChartStats:",
  typeof getChartStats
);

console.log(
  "getRecentActivities:",
  typeof getRecentActivities
);

console.log(
  "getUsers:",
  typeof getUsers
);

console.log(
  "getUserById:",
  typeof getUserById
);

console.log(
  "updateUser:",
  typeof updateUser
);

console.log(
  "deleteUser:",
  typeof deleteUser
);

console.log(
  "getAdminSettings:",
  typeof getAdminSettings
);

console.log(
  "updateAdminSettings:",
  typeof updateAdminSettings
);

console.log("=================================");

// =====================================================
// TEST
// =====================================================

router.get(
  "/test",
  adminTest
);

// =====================================================
// DASHBOARD STATISTICS
// =====================================================
//
// Final URL:
//
// GET /api/admin/stats
//
// =====================================================

router.get(
  "/stats",
  getDashboardStats
);

// =====================================================
// CHART STATISTICS
// =====================================================
//
// Final URL:
//
// GET /api/admin/chart-stats
//
// =====================================================

router.get(
  "/chart-stats",
  getChartStats
);

// =====================================================
// RECENT ACTIVITIES
// =====================================================
//
// Final URL:
//
// GET /api/admin/recent-activities
//
// =====================================================

router.get(
  "/recent-activities",
  getRecentActivities
);

// =====================================================
// USERS
// =====================================================
//
// GET    /api/admin/users
// GET    /api/admin/users/:id
// PUT    /api/admin/users/:id
// DELETE /api/admin/users/:id
//
// =====================================================

router.get(
  "/users",
  getUsers
);

router.get(
  "/users/:id",
  getUserById
);

router.put(
  "/users/:id",
  updateUser
);

router.delete(
  "/users/:id",
  deleteUser
);

// =====================================================
// ADMIN SETTINGS
// =====================================================
//
// GET /api/admin/settings
// PUT /api/admin/settings
//
// =====================================================

router.get(
  "/settings",
  getAdminSettings
);

router.put(
  "/settings",
  updateAdminSettings
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;