const express = require("express");

const router = express.Router();

const {
  createSupportRequest,
  getSupportRequests,
  getAdminSupportRequests,
  getManagerSupportRequests,
  getMySupportRequests,
  getSupportRequestById,
  updateSupportRequest,
  deleteSupportRequest,
} = require("../controllers/supportController");


console.log("=================================");
console.log("SUPPORT ROUTES FILE LOADED");
console.log("=================================");
router.get("/test", (req, res) => {
  console.log("🔥 SUPPORT TEST ROUTE HIT");

  return res.status(200).json({
    success: true,
    message: "Support route is working",
  });
});
// =====================================================
// CREATE SUPPORT REQUEST
// POST /api/support
// =====================================================

router.post(
  "/",
  createSupportRequest
);

// =====================================================
// GET ALL
// GET /api/support
// =====================================================

router.get(
  "/",
  getSupportRequests
);

// =====================================================
// ADMIN REQUESTS
// GET /api/support/admin
// =====================================================

router.get(
  "/admin",
  getAdminSupportRequests
);

// =====================================================
// MANAGER REQUESTS
// GET /api/support/manager
// =====================================================

router.get(
  "/manager",
  getManagerSupportRequests
);

// =====================================================
// JOB SEEKER OWN REQUESTS
// GET /api/support/my-requests?email=xxx
// =====================================================

router.get(
  "/my-requests",
  getMySupportRequests
);

// =====================================================
// TEST
// =====================================================

router.get(
  "/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Support route is working",
    });
  }
);

// =====================================================
// GET BY ID
// GET /api/support/:id
// =====================================================

router.get(
  "/:id",
  getSupportRequestById
);

// =====================================================
// UPDATE
// PUT /api/support/:id
// =====================================================

router.put(
  "/:id",
  updateSupportRequest
);

// =====================================================
// DELETE
// DELETE /api/support/:id
// =====================================================

router.delete(
  "/:id",
  deleteSupportRequest
);

module.exports = router;