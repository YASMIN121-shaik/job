const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// CONTROLLERS
// =====================================================

const jobController = require("../controllers/jobController");
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middlewares/authMiddleware");

// =====================================================
// GET FUNCTIONS
// =====================================================

const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  scheduleInterview,
   getInterviews,
} = jobController;

const {
  getApplications,
  updateApplicationStatus,
  deleteApplication,
} = applicationController;

const {
  authenticateToken,
} = authMiddleware;

// =====================================================
// DEBUG
// =====================================================

console.log("=================================");
console.log("JOB ROUTES FILE LOADED");
console.log("=================================");

console.log("JOB CONTROLLER:");
console.log("getAllJobs:", typeof getAllJobs);
console.log("getJobById:", typeof getJobById);
console.log("createJob:", typeof createJob);
console.log("updateJob:", typeof updateJob);
console.log("deleteJob:", typeof deleteJob);
console.log("scheduleInterview:",typeof scheduleInterview);

console.log("---------------------------------");

console.log("APPLICATION CONTROLLER:");
console.log("getApplications:", typeof getApplications);
console.log(
  "updateApplicationStatus:",
  typeof updateApplicationStatus
);
console.log(
  "deleteApplication:",
  typeof deleteApplication
);

console.log("---------------------------------");

console.log(
  "authenticateToken:",
  typeof authenticateToken
);

console.log("=================================");

// =====================================================
// STOP IMMEDIATELY IF A HANDLER IS INVALID
// =====================================================

const requiredHandlers = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  scheduleInterview,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  authenticateToken,
};

for (const [name, handler] of Object.entries(
  requiredHandlers
)) {
  if (typeof handler !== "function") {
    throw new TypeError(
      `${name} is not a function. Check its module.exports.`
    );
  }
}

console.log(
  "✅ ALL JOB ROUTE HANDLERS ARE VALID"
);

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "job-descriptions"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// MULTER
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const filename =
      "job-description-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    file.mimetype === "application/pdf" ||
    extension === ".pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// GET ALL JOBS
// GET /api/jobs
// =====================================================

router.get(
  "/",
  getAllJobs
);

// =====================================================
// GET APPLICATIONS
// GET /api/jobs/applications
// =====================================================

router.get(
  "/applications",
  authenticateToken,
  getApplications
);

router.get(
  "/interviews",
  authenticateToken,
  getInterviews
);

// =====================================================
// UPDATE APPLICATION STATUS
// PUT /api/jobs/applications/:id/status
// =====================================================

router.put(
  "/applications/:id/status",
  authenticateToken,
  updateApplicationStatus
);


// =====================================================
// DELETE APPLICATION
// DELETE /api/jobs/applications/:id
// =====================================================

router.delete(
  "/applications/:id",
  authenticateToken,
  deleteApplication
);

router.post(
  "/interviews",
  authenticateToken,
  scheduleInterview
);

// =====================================================
// CREATE JOB
// POST /api/jobs
// =====================================================

router.post(
  "/",
  authenticateToken,
  upload.single("descriptionFile"),
  createJob
);

// =====================================================
// GET JOB BY ID
// GET /api/jobs/:id
// =====================================================

router.get(
  "/:id",
  getJobById
);

// =====================================================
// UPDATE JOB
// PUT /api/jobs/:id
// =====================================================

router.put(
  "/:id",
  authenticateToken,
  upload.single("descriptionFile"),
  updateJob
);

// =====================================================
// DELETE JOB
// DELETE /api/jobs/:id
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  deleteJob
);

// =====================================================
// UPLOAD ERROR HANDLER
// =====================================================

router.use((error, req, res, next) => {
  console.error(
    "JOB ROUTE ERROR:",
    error
  );

  if (error instanceof multer.MulterError) {
    if (
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "PDF file size must be less than 5 MB",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message:
      error.message ||
      "File upload failed",
  });
});

// =====================================================
// EXPORT
// =====================================================

module.exports = router;