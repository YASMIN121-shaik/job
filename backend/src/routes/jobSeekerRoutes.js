const express = require("express");

const router = express.Router();

// =====================================================
// JOB SEEKER CONTROLLER
// =====================================================

const {
  test,
  getDashboard,

  // Applications
  getApplications,
  getShortlist,
  getRejectedApplications,
  getApplicationById,
  applyForJob,

  // Saved Jobs
  getSavedJobs,
  saveJob,
  removeSavedJob,

  // Interviews
  getInterviews,

  // Notifications
  getNotifications,
  markNotificationRead,
  getUnreadNotificationCount,

  // Assessments
  getAssessments,
  getAssessmentQuestions,
  saveAssessmentResult,

  // Resume
  getResume,
  saveResume,

  // Profile
  getProfile,
  getProfileById,
  updateProfile,

  // Password
  changeJobSeekerPassword,
} = require("../controllers/jobSeekerController");

// =====================================================
// MIDDLEWARE
// =====================================================

const uploadResume = require("../middlewares/uploadResume");

// =====================================================
// APPLICATION CONTROLLER
// =====================================================
// Keep these ONLY if these functions actually exist in
// applicationController.js.
//
// If you do not have these functions, remove this block
// and the PUT/DELETE application routes below.

const {
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

// =====================================================
// TEST
// =====================================================

// GET /api/jobseeker/test
router.get("/test", test);

// =====================================================
// DASHBOARD
// =====================================================

// GET /api/jobseeker/dashboard?email=xxx
router.get("/dashboard", getDashboard);

// =====================================================
// APPLICATIONS
// =====================================================

// GET /api/jobseeker/applications?email=xxx
router.get("/applications", getApplications);

// GET /api/jobseeker/applications/:id?email=xxx
router.get(
  "/applications/:id",
  getApplicationById
);

// GET /api/jobseeker/shortlist?email=xxx
router.get(
  "/shortlist",
  getShortlist
);

// GET /api/jobseeker/rejected?email=xxx
router.get(
  "/rejected",
  getRejectedApplications
);

// =====================================================
// APPLY FOR JOB
// =====================================================

// POST /api/jobseeker/apply
//
// IMPORTANT:
// applyForJob comes from jobSeekerController,
// so use applyForJob directly.
// Do NOT use jobSeekerController.applyForJob.

router.post(
  "/apply",
  uploadResume.single("resume"),
  applyForJob
);

// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

// PUT /api/jobseeker/applications/:id/status
router.put(
  "/applications/:id/status",
  updateApplicationStatus
);

// =====================================================
// DELETE APPLICATION
// =====================================================

// DELETE /api/jobseeker/applications/:id
router.delete(
  "/applications/:id",
  deleteApplication
);

// =====================================================
// SAVED JOBS
// =====================================================

// GET /api/jobseeker/saved-jobs?email=xxx
router.get(
  "/saved-jobs",
  getSavedJobs
);

// POST /api/jobseeker/saved-jobs
router.post(
  "/saved-jobs",
  saveJob
);

// DELETE /api/jobseeker/saved-jobs
router.delete(
  "/saved-jobs",
  removeSavedJob
);

// =====================================================
// INTERVIEWS
// =====================================================

// GET /api/jobseeker/interviews?email=xxx
router.get(
  "/interviews",
  getInterviews
);

// =====================================================
// NOTIFICATIONS
// =====================================================

// GET /api/jobseeker/notifications/unread-count?email=xxx
router.get(
  "/notifications/unread-count",
  getUnreadNotificationCount
);

// GET /api/jobseeker/notifications?email=xxx
router.get(
  "/notifications",
  getNotifications
);

// PUT /api/jobseeker/notifications/:id/read
router.put(
  "/notifications/:id/read",
  markNotificationRead
);

// =====================================================
// SKILL ASSESSMENTS
// =====================================================

// GET /api/jobseeker/assessments
router.get(
  "/assessments",
  getAssessments
);

// GET /api/jobseeker/assessments/:assessmentId/questions
router.get(
  "/assessments/:assessmentId/questions",
  getAssessmentQuestions
);

// POST /api/jobseeker/assessment-results
router.post(
  "/assessment-results",
  saveAssessmentResult
);

// =====================================================
// RESUME
// =====================================================

// GET /api/jobseeker/resume?email=xxx
router.get(
  "/resume",
  getResume
);

// PUT /api/jobseeker/resume
router.put(
  "/resume",
  saveResume
);

// =====================================================
// PROFILE
// =====================================================

// GET /api/jobseeker/profile?email=xxx
router.get(
  "/profile",
  getProfile
);

// GET /api/jobseeker/profile/:id
router.get(
  "/profile/:id",
  getProfileById
);

// PUT /api/jobseeker/profile/:id
router.put(
  "/profile/:id",
  updateProfile
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

// PUT /api/jobseeker/profile/:id/password
router.put(
  "/profile/:id/password",
  changeJobSeekerPassword
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;