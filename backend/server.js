require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./db");

// =====================================================
// CONFIG
// =====================================================

const corsOptions = require("./src/config/cors");
const config = require("./src/config");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const managerRoutes = require("./src/routes/managerRoutes");
const jobSeekerRoutes = require("./src/routes/jobSeekerRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");



const supportRoutes = require("./src/routes/supportRoutes");
const jobHolderRoutes =require("./src/routes/jobHolderRoutes");
// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors(corsOptions));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================================
// AUTH ROUTES
// =====================================================
//
// IMPORTANT
//
// These routes become:
//
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/forgot-password
//
// Do NOT use:
//
// /api/auth/admin/...
// /api/auth/users
//
// Admin routes are mounted separately below.
//

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// ADMIN ROUTES
// =====================================================
//
// adminRoutes should contain:
//
// router.get("/test", ...)
// router.get("/users", ...)
// router.get("/stats", ...)
// router.get("/recent-activities", ...)
// router.get("/recent-jobs", ...)
// router.get("/monthly-report", ...)
//
// Final URLs:
//
// GET /api/admin/test
// GET /api/admin/users
// GET /api/admin/stats
// GET /api/admin/recent-activities
// GET /api/admin/recent-jobs
// GET /api/admin/monthly-report
//
// =====================================================

app.use(
  "/api/admin",
  adminRoutes
);

// =====================================================
// JOB ROUTES
// =====================================================

app.use(
  "/api/jobs",
  jobRoutes
);

// =====================================================
// MANAGER ROUTES
// =====================================================

app.use(
  "/api/manager",
  managerRoutes
);

// =====================================================
// JOB SEEKER ROUTES
// =====================================================
//
// Examples:
//
// GET  /api/jobseeker/dashboard
// GET  /api/jobseeker/applications
// GET  /api/jobseeker/saved-jobs
// GET  /api/jobseeker/interviews
// POST /api/jobseeker/apply
//
// =====================================================

app.use(
  "/api/jobseeker",
  jobSeekerRoutes
);

// =====================================================
// NOTIFICATION ROUTES
// =====================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// ASSESSMENT ROUTES
// =====================================================
//
// IMPORTANT:
//
// This assumes assessmentRoutes.js contains routes such as:
//
// router.get("/", ...)
// router.get("/:id", ...)
//
// Therefore the final URL is:
//
// /api/jobseeker/assessments
//
// If assessmentRoutes.js already has "/assessments"
// inside its router paths, change this mounting accordingly.
// =====================================================



// =====================================================
// SUPPORT ROUTES
// =====================================================

app.use(
  "/api/support",
  supportRoutes
);

app.use(
  "/api/jobholder",
  jobHolderRoutes
);

// =====================================================
// ROOT / DATABASE TEST
// =====================================================

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json({
      success: true,
      message:
        "PostgreSQL Connected Successfully",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(
      "DATABASE CONNECTION ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Database connection failed",
      error: err.message,
    });
  }
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Job Portal Backend is running",
      environment:
        config.nodeEnv,
      port:
        config.port,
    });
  }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {
    console.log(
      `404 ROUTE NOT FOUND: ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({
      success: false,
      message:
        "Route not found",
      path:
        req.originalUrl,
    });
  }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
  }
);

// =====================================================
// SERVER
// =====================================================

const PORT =
  config.port ||
  process.env.PORT ||
  5000;

app.listen(
  PORT,
  () => {
    console.log(
      "================================="
    );

    console.log(
      "JOB PORTAL BACKEND SERVER"
    );

    console.log(
      "================================="
    );

    console.log(
      `✅ Server is running on port ${PORT}`
    );

    console.log(
      `🌐 http://localhost:${PORT}`
    );

    console.log(
      `❤️ Health: http://localhost:${PORT}/api/health`
    );

    console.log(
      `📁 Uploads: http://localhost:${PORT}/uploads`
    );

    console.log(
      `👑 Admin Test: http://localhost:${PORT}/api/admin/test`
    );

    console.log(
      `📊 Admin Stats: http://localhost:${PORT}/api/admin/stats`
    );

    console.log(
      `👥 Admin Users: http://localhost:${PORT}/api/admin/users`
    );

    console.log(
      `📝 Assessments: http://localhost:${PORT}/api/jobseeker/assessments`
    );

    console.log(
      "================================="
    );
  }
);