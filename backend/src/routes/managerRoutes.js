const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const pool = require("../../db");

// =====================================================
// MIDDLEWARE
// =====================================================

const {
  authenticateToken,
} = require("../middlewares/authMiddleware");

const {
  authorizeRoles,
} = require("../middlewares/roleMiddleware");

// =====================================================
// MANAGER CONTROLLER
// =====================================================

const {
  createManager,
  getManagers,
  getManagerById,
  updateManager,
  changeManagerPassword,
  deleteManager,
  getDashboard,

  // Manager interview actions
  getManagerInterviews,
  completeInterview,
  selectCandidate,
  rejectApplication,
} = require("../controllers/managerController");

// =====================================================
// INTERVIEW CONTROLLER
// =====================================================

const {
  createInterview,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");

// =====================================================
// CREATE MANAGER
// POST /api/manager/create
// ADMIN ONLY
// =====================================================

router.post(
  "/create",
  authenticateToken,
  authorizeRoles("admin"),
  createManager
);

// =====================================================
// MANAGER DASHBOARD
// GET /api/manager/dashboard
// =====================================================

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("manager"),
  getDashboard
);

// =====================================================
// MANAGER PROFILE
// =====================================================

router.get(
  "/profile/:id",
  authenticateToken,
  authorizeRoles("manager"),
  getManagerById
);

router.put(
  "/profile/:id",
  authenticateToken,
  authorizeRoles("manager"),
  updateManager
);

router.put(
  "/profile/:id/password",
  authenticateToken,
  authorizeRoles("manager"),
  changeManagerPassword
);

router.delete(
  "/profile/:id",
  authenticateToken,
  authorizeRoles("manager"),
  deleteManager
);

// =====================================================
// RECRUITERS
// =====================================================

// GET /api/manager/recruiters

router.get(
  "/recruiters",
  authenticateToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          fullname,
          email,
          company,
          phone,
          designation,
          location,
          role
        FROM users
        WHERE role = 'job_holder'
        ORDER BY id DESC
      `);

      return res.status(200).json({
        success: true,
        recruiters: result.rows,
      });

    } catch (error) {
      console.error(
        "GET RECRUITERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch recruiters.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// UPDATE RECRUITER
// PUT /api/manager/recruiters/:id
// =====================================================

router.put(
  "/recruiters/:id",
  authenticateToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        fullname,
        email,
        company,
        phone,
        designation,
        location,
      } = req.body;

      const result = await pool.query(
        `
        UPDATE users
        SET
          fullname = COALESCE($1, fullname),
          email = COALESCE($2, email),
          company = COALESCE($3, company),
          phone = COALESCE($4, phone),
          designation = COALESCE($5, designation),
          location = COALESCE($6, location)
        WHERE id = $7
          AND role = 'job_holder'
        RETURNING
          id,
          fullname,
          email,
          role,
          company,
          phone,
          designation,
          location
        `,
        [
          fullname?.trim() || null,
          email?.trim() || null,
          company?.trim() || null,
          phone?.trim() || null,
          designation?.trim() || null,
          location?.trim() || null,
          id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Recruiter not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Recruiter updated successfully.",
        recruiter: result.rows[0],
      });

    } catch (error) {
      console.error(
        "UPDATE RECRUITER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update recruiter.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// DELETE RECRUITER
// DELETE /api/manager/recruiters/:id
// =====================================================

router.delete(
  "/recruiters/:id",
  authenticateToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        DELETE FROM users
        WHERE id = $1
          AND role = 'job_holder'
        RETURNING
          id,
          fullname,
          email
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Recruiter not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Recruiter deleted successfully.",
        recruiter: result.rows[0],
      });

    } catch (error) {
      console.error(
        "DELETE RECRUITER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete recruiter.",
        error: error.message,
      });
    }
  }
);

// =====================================================
// ADD RECRUITER
// POST /api/manager/add-user
// =====================================================

router.post(
  "/add-user",
  authenticateToken,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const {
        fullname,
        email,
        password,
        company,
        phone,
        designation,
        location,
      } = req.body;

      if (
        !fullname ||
        !email ||
        !password ||
        !company
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Full name, email, password and company are required.",
        });
      }

      const existingUser = await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [email.trim()]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "A user with this email already exists.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const result = await pool.query(
        `
        INSERT INTO users
        (
          fullname,
          email,
          password,
          role,
          company,
          phone,
          designation,
          location
        )
        VALUES
        (
          $1,
          $2,
          $3,
          'job_holder',
          $4,
          $5,
          $6,
          $7
        )
        RETURNING
          id,
          fullname,
          email,
          role,
          company,
          phone,
          designation,
          location
        `,
        [
          fullname.trim(),
          email.trim(),
          hashedPassword,
          company.trim(),
          phone || null,
          designation || null,
          location || null,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Recruiter added successfully.",
        recruiter: result.rows[0],
      });

    } catch (error) {
      console.error(
        "ADD RECRUITER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to add recruiter.",
        errorCode: error.code || null,
        detail: error.detail || null,
      });
    }
  }
);

// =====================================================
// MANAGER INTERVIEWS
// =====================================================
//
// IMPORTANT:
// There must be ONLY ONE GET /interviews route.
//
// Frontend:
// GET http://localhost:5000/api/manager/interviews
//
// =====================================================

router.get(
  "/interviews",
  authenticateToken,
  authorizeRoles("manager"),
  getManagerInterviews
);

// =====================================================
// CREATE INTERVIEW
// POST /api/manager/interviews
// =====================================================

router.post(
  "/interviews",
  authenticateToken,
  authorizeRoles("manager"),
  createInterview
);

// =====================================================
// UPDATE INTERVIEW
// PUT /api/manager/interviews/:id
// =====================================================

router.put(
  "/interviews/:id",
  authenticateToken,
  authorizeRoles("manager"),
  updateInterview
);

// =====================================================
// DELETE INTERVIEW
// DELETE /api/manager/interviews/:id
// =====================================================

router.delete(
  "/interviews/:id",
  authenticateToken,
  authorizeRoles("manager"),
  deleteInterview
);

// =====================================================
// MARK INTERVIEW COMPLETED
// PUT /api/manager/interviews/:interviewId/complete
// =====================================================

router.put(
  "/interviews/:interviewId/complete",
  authenticateToken,
  authorizeRoles("manager"),
  completeInterview
);

// =====================================================
// SELECT CANDIDATE
// PUT /api/manager/applications/:applicationId/select
// =====================================================

router.put(
  "/applications/:applicationId/select",
  authenticateToken,
  authorizeRoles("manager"),
  selectCandidate
);

// =====================================================
// GET ALL MANAGERS
// GET /api/manager
// ADMIN ONLY
// =====================================================

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getManagers
);

// =====================================================
// GET MANAGER BY ID
// GET /api/manager/:id
// ADMIN ONLY
// =====================================================

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getManagerById
);

// =====================================================
// DELETE MANAGER
// DELETE /api/manager/:id
// ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteManager
);
router.put(
  "/applications/:applicationId/reject",
  authenticateToken,
  authorizeRoles("manager"),
  rejectApplication
);
// =====================================================
// EXPORT
// =====================================================

module.exports = router;