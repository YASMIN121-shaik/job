const pool = require("../../db");
const managerModel = require("../models/managerModel");

// =====================================================
// CREATE MANAGER
// POST /api/manager/create
// =====================================================

const createManager = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      company,
      designation,
      location,
      password,
    } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Fullname, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const cleanFullname = fullname.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullname || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Fullname and email cannot be empty",
      });
    }

    // -------------------------------------------------
    // CHECK EMAIL
    // -------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // -------------------------------------------------
    // CREATE MANAGER
    // -------------------------------------------------

    const manager =
      await managerModel.createManager({
        fullname: cleanFullname,
        email: cleanEmail,
        phone,
        company,
        designation,
        location,
        password,
      });

    if (!manager) {
      return res.status(500).json({
        success: false,
        message: "Failed to create manager",
      });
    }

    // Never return password
    delete manager.password;

    return res.status(201).json({
      success: true,
      message: "Manager created successfully",
      manager,
    });
  } catch (error) {
    console.error(
      "CREATE MANAGER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create manager",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL MANAGERS
// GET /api/manager
// =====================================================

const getManagers = async (req, res) => {
  try {
    const managers =
      await managerModel.getAllManagers();

    return res.json({
      success: true,
      managers,
    });
  } catch (error) {
    console.error(
      "GET MANAGERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch managers",
      error: error.message,
    });
  }
};

// =====================================================
// GET MANAGER BY ID
// GET /api/manager/:id
// =====================================================

const getManagerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Manager ID is required",
      });
    }

    const manager =
      await managerModel.getManagerById(id);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    return res.json({
      success: true,
      manager,
    });
  } catch (error) {
    console.error(
      "GET MANAGER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch manager",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MANAGER
// PUT /api/manager/:id
// =====================================================

const updateManager = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullname,
      email,
      phone,
      company,
      designation,
      location,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Manager ID is required",
      });
    }

    if (!fullname || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Fullname and email are required",
      });
    }

    const cleanFullname = fullname.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullname || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Fullname and email cannot be empty",
      });
    }

    // -------------------------------------------------
    // CHECK DUPLICATE EMAIL
    // -------------------------------------------------

    const existingEmail = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(TRIM(email)) =
            LOWER(TRIM($1))
      AND id != $2
      LIMIT 1
      `,
      [cleanEmail, id]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const manager =
      await managerModel.updateManager({
        id,
        fullname: cleanFullname,
        email: cleanEmail,
        phone,
        company,
        designation,
        location,
      });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    delete manager.password;

    return res.json({
      success: true,
      message:
        "Manager profile updated successfully",
      manager,
    });
  } catch (error) {
    console.error(
      "UPDATE MANAGER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update manager",
      error: error.message,
    });
  }
};

// =====================================================
// CHANGE MANAGER PASSWORD
// PUT /api/manager/:id/password
// =====================================================

const changeManagerPassword = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all password fields",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    const result =
      await managerModel.changePassword({
        id,
        currentPassword,
        newPassword,
      });

    if (!result.success) {
      return res
        .status(
          result.message ===
            "Manager not found"
            ? 404
            : 400
        )
        .json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error(
      "CHANGE MANAGER PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change password",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE MANAGER
// DELETE /api/manager/:id
// =====================================================

const deleteManager = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Manager ID is required",
      });
    }

    const deleted =
      await managerModel.deleteManager(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    return res.json({
      success: true,
      message: "Manager deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE MANAGER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete manager",
      error: error.message,
    });
  }
};

// =====================================================
// MANAGER DASHBOARD
// GET /api/manager/dashboard
// =====================================================

const getDashboard = async (req, res) => {
  try {
    const [
      totalJobs,
      applicants,
      interviews,
      recruiters,
      jobStatus,
      recentJobs,
      recentApplicants,
    ] = await Promise.all([
      managerModel.getTotalJobs(),

      managerModel.getApplicationCount(),

      managerModel.getInterviewCount(),

      managerModel.getRecruiterCount(),

      managerModel.getJobStatusCounts(),

      managerModel.getRecentJobs(),

      managerModel.getRecentApplicants(),
    ]);

    return res.json({
      success: true,

      stats: {
        totalJobs,

        applicants,

        interviews,

        recruiters,

        approvedJobs:
          jobStatus.approvedJobs,

        openJobs:
          jobStatus.openJobs,
      },

      recentJobs,

      recentApplicants,
    });
  } catch (error) {
    console.error(
      "MANAGER DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load manager dashboard",
      error: error.message,
    });
  }
};

// =====================================================
// GET MANAGER INTERVIEWS
// GET /api/manager/interviews
// =====================================================

const getManagerInterviews = async (
  req,
  res
) => {
  try {
    const interviews =
      await managerModel.getManagerInterviews();

    return res.json({
      success: true,
      interviews,
    });
  } catch (error) {
    console.error(
      "GET MANAGER INTERVIEWS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch manager interviews",
      error: error.message,
    });
  }
};

// =====================================================
// MARK INTERVIEW AS COMPLETED
// PUT /api/manager/interviews/:interviewId/complete
// =====================================================

const completeInterview = async (
  req,
  res
) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message:
          "Interview ID is required",
      });
    }

    const interview =
      await managerModel.completeInterview(
        interviewId
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Interview marked as completed",
      interview,
    });
  } catch (error) {
    console.error(
      "COMPLETE INTERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete interview",
      error: error.message,
    });
  }
};

// =====================================================
// SELECT CANDIDATE
// PUT /api/manager/applications/:applicationId/select
// =====================================================

const selectCandidate = async (
  req,
  res
) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message:
          "Application ID is required",
      });
    }

    const result =
      await managerModel.selectCandidate(
        applicationId
      );

    if (!result.success) {
      switch (result.code) {
        case "NOT_FOUND":
          return res.status(404).json(
            result
          );

        case "NO_INTERVIEW":
        case "INTERVIEW_NOT_COMPLETED":
        case "ALREADY_SELECTED":
          return res.status(400).json(
            result
          );

        case "TABLE_MISSING":
        case "APPLICATION_COLUMNS_MISSING":
          return res.status(500).json(
            result
          );

        default:
          return res.status(400).json(
            result
          );
      }
    }

    return res.json(result);
  } catch (error) {
    console.error(
      "SELECT CANDIDATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to select candidate",
      error: error.message,
    });
  }
};
// =====================================================
// REJECT APPLICATION
// PUT /api/manager/applications/:applicationId/reject
// =====================================================

const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    // -------------------------------------------------
    // Check application
    // -------------------------------------------------

    const applicationResult = await pool.query(
      `
      SELECT
        a.id,
        a.email,
        a.applicant_name,
        a.status
      FROM applications a
      WHERE a.id = $1
      `,
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application = applicationResult.rows[0];

    // -------------------------------------------------
    // Update application status
    // -------------------------------------------------

    const updateResult = await pool.query(
      `
      UPDATE applications
      SET status = 'rejected'
      WHERE id = $1
      RETURNING *
      `,
      [applicationId]
    );

    // -------------------------------------------------
    // Optional notification
    // -------------------------------------------------

    try {
      await pool.query(
        `
        INSERT INTO notifications
        (
          email,
          type,
          title,
          message
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        `,
        [
          application.email,
          "application",
          "Application Rejected",
          `Your application for ${application.applicant_name || "the position"} has been rejected.`,
        ]
      );
    } catch (notificationError) {
      console.error(
        "REJECTION NOTIFICATION ERROR:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      application: updateResult.rows[0],
    });
  } catch (error) {
    console.error(
      "REJECT APPLICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reject application",
      error: error.message,
    });
  }
};
// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createManager,

  getManagers,

  getManagerById,

  updateManager,

  changeManagerPassword,

  deleteManager,

  getDashboard,

  getManagerInterviews,

  completeInterview,

  selectCandidate,
  rejectApplication,
};