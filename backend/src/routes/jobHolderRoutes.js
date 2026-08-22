const express = require("express");

const router = express.Router();

const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const {
  createJobHolder,
  getDashboard,
  getMyProfile,
  getJobHolders,
  getJobHolder,
  getApplicants,
  getInterviews,
  getApprovedJobs,
  updateJobHolder,
  deleteJobHolder,
} = require("../controllers/jobHolderController");

// =====================================================
// ADMIN
// =====================================================

router.post(
  "/create",
  authenticateToken,
  authorizeRoles("admin"),
  createJobHolder
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getJobHolders
);

// =====================================================
// JOB HOLDER DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("job_holder"),
  getDashboard
);

// =====================================================
// JOB HOLDER PROFILE
// =====================================================

router.get(
  "/me",
  authenticateToken,
  authorizeRoles("job_holder"),
  getMyProfile
);

// =====================================================
// JOB HOLDER APPLICANTS
// =====================================================

router.get(
  "/applicants",
  authenticateToken,
  authorizeRoles("job_holder"),
  getApplicants
);

// =====================================================
// JOB HOLDER INTERVIEWS
// =====================================================

router.get(
  "/interviews",
  authenticateToken,
  authorizeRoles("job_holder"),
  getInterviews
);

// =====================================================
// JOB HOLDER APPROVED JOBS
// =====================================================

router.get(
  "/approved-jobs",
  authenticateToken,
  authorizeRoles("job_holder"),
  getApprovedJobs
);

// =====================================================
// ADMIN GET / UPDATE / DELETE JOB HOLDER
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getJobHolder
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateJobHolder
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteJobHolder
);

module.exports = router;