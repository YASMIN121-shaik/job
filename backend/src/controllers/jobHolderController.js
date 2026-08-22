const bcrypt = require("bcrypt");
const pool = require("../../db");
const jobHolderModel = require("../models/jobHolderModel");

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getAuthUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.user?.user_id ||
    null
  );
};

const getAuthEmail = (req) => {
  return req.user?.email || null;
};

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase();
};

const normalizeCompany = (company) => {
  return String(company || "")
    .trim()
    .toLowerCase();
};

// =====================================================
// GET LOGGED-IN JOB HOLDER
// =====================================================

const getLoggedInJobHolder = async (req) => {
  const userId = getAuthUserId(req);
  const userEmail = getAuthEmail(req);

  if (!userId && !userEmail) {
    return null;
  }

  let result;

  if (userId) {
    result = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        company,
        location,
        role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );
  } else {
    result = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        company,
        location,
        role
      FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
      LIMIT 1
      `,
      [userEmail]
    );
  }

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// =====================================================
// CREATE JOB HOLDER
// POST /api/jobholder/create
// ADMIN ONLY
// =====================================================

const createJobHolder = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      company,
      password,
      location,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!fullname || !String(fullname).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // -------------------------------------------------
    // NORMALIZE
    // -------------------------------------------------

    const normalizedName = String(fullname).trim();

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const normalizedPhone = phone
      ? String(phone).trim()
      : "";

    const normalizedCompany = company
      ? String(company).trim()
      : "";

    const normalizedLocation = location
      ? String(location).trim()
      : "";

    // -------------------------------------------------
    // CHECK DUPLICATE EMAIL
    // -------------------------------------------------

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(TRIM(email)) = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // -------------------------------------------------
    // HASH PASSWORD
    // -------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      String(password),
      10
    );

    // -------------------------------------------------
    // CREATE JOB HOLDER
    // -------------------------------------------------

    const jobHolder =
      await jobHolderModel.createJobHolder({
        fullname: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        company: normalizedCompany,
        location: normalizedLocation,
        password: hashedPassword,
      });

    return res.status(201).json({
      success: true,
      message: "Job Holder created successfully",
      jobHolder,
    });

  } catch (error) {
    console.error(
      "CREATE JOB HOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create Job Holder",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB HOLDER DASHBOARD
// GET /api/jobholder/dashboard
// JOB HOLDER ONLY
// =====================================================
//
// IMPORTANT
// -----------------------------------------------------
// jobs table DOES NOT contain created_by.
//
// Therefore all job-holder dashboard information is
// connected using the company field.
//
// Manager company
//       ↓
// jobs.company
//       ↓
// applications.job_id
//       ↓
// interviews.application_id
//
// =====================================================

const getDashboard = async (req, res) => {
  try {
    console.log("========================================");
    console.log("JOB HOLDER DASHBOARD REQUEST");
    console.log("REQ.USER:", req.user);
    console.log("========================================");

    // -------------------------------------------------
    // GET JOB HOLDER
    // -------------------------------------------------

    const user = await getLoggedInJobHolder(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Job Holder account not found",
      });
    }

    // -------------------------------------------------
    // ROLE CHECK
    // -------------------------------------------------

    if (normalizeRole(user.role) !== "job_holder") {
      return res.status(403).json({
        success: false,
        message:
          `This account does not have job_holder role. Current role: ${user.role}`,
      });
    }

    // -------------------------------------------------
    // COMPANY CHECK
    // -------------------------------------------------

    if (!user.company || !String(user.company).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Job Holder company is not configured",
      });
    }

    const company = normalizeCompany(user.company);

    console.log(
      "JOB HOLDER COMPANY:",
      company
    );

    // =================================================
    // TOTAL JOBS
    // =================================================

    let totalJobs = 0;

    try {
      const result = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM jobs
        WHERE LOWER(TRIM(company)) = $1
        `,
        [company]
      );

      totalJobs =
        Number(result.rows[0]?.count) || 0;

    } catch (error) {
      console.error(
        "TOTAL JOBS ERROR:",
        error.message
      );
    }

    // =================================================
    // ACTIVE JOBS
    // =================================================

    let activeJobs = 0;

    try {
      const result = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM jobs
        WHERE LOWER(TRIM(company)) = $1
          AND LOWER(TRIM(COALESCE(status, ''))) IN (
            'active',
            'open',
            'approved'
          )
        `,
        [company]
      );

      activeJobs =
        Number(result.rows[0]?.count) || 0;

    } catch (error) {
      console.error(
        "ACTIVE JOBS ERROR:",
        error.message
      );
    }

    // =================================================
    // TOTAL APPLICANTS
    // =================================================

    let totalApplicants = 0;

    try {
      const result = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM applications a

        INNER JOIN jobs j
          ON j.id = a.job_id

        WHERE LOWER(TRIM(j.company)) = $1
        `,
        [company]
      );

      totalApplicants =
        Number(result.rows[0]?.count) || 0;

    } catch (error) {
      console.error(
        "APPLICANTS ERROR:",
        error.message
      );

      totalApplicants = 0;
    }

    // =================================================
    // TOTAL INTERVIEWS
    // =================================================

    let totalInterviews = 0;

    try {
      const result = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM interviews i

        INNER JOIN applications a
          ON a.id = i.application_id

        INNER JOIN jobs j
          ON j.id = a.job_id

        WHERE LOWER(TRIM(j.company)) = $1
        `,
        [company]
      );

      totalInterviews =
        Number(result.rows[0]?.count) || 0;

    } catch (error) {
      console.error(
        "INTERVIEWS ERROR:",
        error.message
      );

      totalInterviews = 0;
    }

    // =================================================
    // RECENT JOBS
    // =================================================

    let recentJobs = [];

    try {
      const result = await pool.query(
        `
        SELECT
          id,
          title,
          company,
          location,
          status,
          job_type,
          salary,
          last_date,
          created_at
        FROM jobs

        WHERE LOWER(TRIM(company)) = $1

        ORDER BY
          created_at DESC NULLS LAST,
          id DESC

        LIMIT 5
        `,
        [company]
      );

      recentJobs = result.rows || [];

    } catch (error) {
      console.error(
        "RECENT JOBS ERROR:",
        error.message
      );

      recentJobs = [];
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      user: {
        id: user.id,
        fullname: user.fullname || "",
        email: user.email || "",
        phone: user.phone || "",
        company: user.company || "",
        location: user.location || "",
        role: user.role || "",
      },

      stats: {
        totalJobs,
        activeJobs,
        totalApplicants,
        totalInterviews,
      },

      recentJobs,
    });

  } catch (error) {
    console.error(
      "JOB HOLDER DASHBOARD FATAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load Job Holder dashboard",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY PROFILE
// GET /api/jobholder/me
// =====================================================

const getMyProfile = async (req, res) => {
  try {
    const user = await getLoggedInJobHolder(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder profile not found",
      });
    }

    if (normalizeRole(user.role) !== "job_holder") {
      return res.status(403).json({
        success: false,
        message:
          "Only Job Holders can access this profile",
      });
    }

    return res.status(200).json({
      success: true,
      jobHolder: user,
    });

  } catch (error) {
    console.error(
      "GET MY JOB HOLDER PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL JOB HOLDERS
// GET /api/jobholder
// =====================================================

const getJobHolders = async (req, res) => {
  try {
    const jobHolders =
      await jobHolderModel.getAllJobHolders();

    return res.status(200).json({
      success: true,
      jobHolders,
      total: jobHolders.length,
    });

  } catch (error) {
    console.error(
      "GET JOB HOLDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch Job Holders",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB HOLDER BY ID
// GET /api/jobholder/:id
// =====================================================

const getJobHolder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Job Holder ID is required",
      });
    }

    const jobHolder =
      await jobHolderModel.getJobHolderById(id);

    if (!jobHolder) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder not found",
      });
    }

    return res.status(200).json({
      success: true,
      jobHolder,
    });

  } catch (error) {
    console.error(
      "GET JOB HOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch Job Holder",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB HOLDER APPLICANTS
// GET /api/jobholder/applicants
// JOB HOLDER ONLY
// =====================================================

const getApplicants = async (req, res) => {
  try {
    console.log("========================================");
    console.log("JOB HOLDER APPLICANTS REQUEST");
    console.log("REQ.USER:", req.user);
    console.log("========================================");

    const user = await getLoggedInJobHolder(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder account not found",
      });
    }

    if (normalizeRole(user.role) !== "job_holder") {
      return res.status(403).json({
        success: false,
        message:
          "Only Job Holders can view applicants",
      });
    }

    if (!user.company || !String(user.company).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Job Holder company is not configured",
      });
    }

    const company =
      normalizeCompany(user.company);

    // -------------------------------------------------
    // GET APPLICANTS THROUGH COMPANY
    // -------------------------------------------------

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.job_id,
        a.applicant_name,
        a.email,
        a.phone,
        a.experience,
        a.resume,
        a.status,
        a.applied_at,

        j.title AS job_title,
        j.company AS job_company,
        j.location AS job_location,
        j.job_type,
        j.category

      FROM applications a

      INNER JOIN jobs j
        ON j.id = a.job_id

      WHERE LOWER(TRIM(j.company)) = $1

      ORDER BY
        a.applied_at DESC NULLS LAST,
        a.id DESC
      `,
      [company]
    );

    console.log(
      "APPLICANTS FOUND:",
      result.rows.length
    );

    return res.status(200).json({
      success: true,
      applicants: result.rows,
      total: result.rows.length,
    });

  } catch (error) {
    console.error(
      "GET JOB HOLDER APPLICANTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch Job Holder applicants",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB HOLDER INTERVIEWS
// GET /api/jobholder/interviews
// JOB HOLDER ONLY
// =====================================================

const getInterviews = async (req, res) => {
  try {
    console.log("========================================");
    console.log("JOB HOLDER INTERVIEWS REQUEST");
    console.log("REQ.USER:", req.user);
    console.log("========================================");

    const user = await getLoggedInJobHolder(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder account not found",
      });
    }

    if (normalizeRole(user.role) !== "job_holder") {
      return res.status(403).json({
        success: false,
        message:
          "Only Job Holders can view interviews",
      });
    }

    if (!user.company || !String(user.company).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Job Holder company is not configured",
      });
    }

    const company =
      normalizeCompany(user.company);

    // -------------------------------------------------
    // GET INTERVIEWS
    // -------------------------------------------------

    const result = await pool.query(
      `
      SELECT
        i.id,
        i.application_id,
        i.interview_date,
        i.interview_time,
        i.interview_type,
        i.interviewer,
        i.status,
        i.notes,
        i.created_at,
        i.meeting_link,
        i.location,

        a.applicant_name,
        a.email,
        a.phone,
        a.experience,
        a.resume,
        a.status AS application_status,
        a.applied_at,

        j.id AS job_id,
        j.title AS job_title,
        j.company,
        j.location AS job_location,
        j.job_type,
        j.category

      FROM interviews i

      INNER JOIN applications a
        ON a.id = i.application_id

      INNER JOIN jobs j
        ON j.id = a.job_id

      WHERE LOWER(TRIM(j.company)) = $1

      ORDER BY
        i.interview_date ASC,
        i.interview_time ASC,
        i.id DESC
      `,
      [company]
    );

    console.log(
      "JOB HOLDER COMPANY:",
      company
    );

    console.log(
      "INTERVIEWS FOUND:",
      result.rows.length
    );

    return res.status(200).json({
      success: true,
      interviews: result.rows,
      total: result.rows.length,
    });

  } catch (error) {
    console.error(
      "GET JOB HOLDER INTERVIEWS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch Job Holder interviews",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB HOLDER APPROVED JOBS
// GET /api/jobholder/approved-jobs
// JOB HOLDER ONLY
// =====================================================

const getApprovedJobs = async (req, res) => {
  try {
    console.log("========================================");
    console.log("JOB HOLDER APPROVED JOBS REQUEST");
    console.log("REQ.USER:", req.user);
    console.log("========================================");

    const user = await getLoggedInJobHolder(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder account not found",
      });
    }

    if (normalizeRole(user.role) !== "job_holder") {
      return res.status(403).json({
        success: false,
        message:
          "Only Job Holders can view approved jobs",
      });
    }

    if (!user.company || !String(user.company).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Job Holder company is not configured",
      });
    }

    const company =
      normalizeCompany(user.company);

    // -------------------------------------------------
    // IMPORTANT
    // -------------------------------------------------
    // jobs DOES NOT HAVE created_by.
    //
    // Therefore use:
    //
    // jobs.company = jobHolder.company
    //
    // -------------------------------------------------

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        company,
        location,
        salary,
        created_at,
        experience,
        job_type,
        category,
        department,
        education,
        vacancies,
        skills,
        description,
        responsibilities,
        benefits,
        last_date,
        status,
        description_file,
        work_mode

      FROM jobs

      WHERE LOWER(TRIM(company)) = $1

        AND LOWER(TRIM(COALESCE(status, '')))
            = 'approved'

      ORDER BY
        created_at DESC NULLS LAST,
        id DESC
      `,
      [company]
    );

    console.log(
      "APPROVED JOBS FOUND:",
      result.rows.length
    );

    return res.status(200).json({
      success: true,
      message:
        "Approved jobs fetched successfully",
      jobs: result.rows,
      total: result.rows.length,
    });

  } catch (error) {
    console.error(
      "GET JOB HOLDER APPROVED JOBS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch Job Holder approved jobs",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE JOB HOLDER
// PUT /api/jobholder/:id
// =====================================================

const updateJobHolder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullname,
      email,
      phone,
      company,
      location,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Job Holder ID is required",
      });
    }

    if (!fullname || !String(fullname).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Full name is required",
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Email is required",
      });
    }

    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();

    // -------------------------------------------------
    // CHECK JOB HOLDER
    // -------------------------------------------------

    const existingJobHolder =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE id = $1
          AND LOWER(TRIM(role)) = 'job_holder'
        LIMIT 1
        `,
        [id]
      );

    if (existingJobHolder.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder not found",
      });
    }

    // -------------------------------------------------
    // CHECK DUPLICATE EMAIL
    // -------------------------------------------------

    const duplicate =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(TRIM(email)) = $1
          AND id <> $2
        LIMIT 1
        `,
        [
          normalizedEmail,
          id,
        ]
      );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Another user already uses this email",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const jobHolder =
      await jobHolderModel.updateJobHolder(
        id,
        {
          fullname:
            String(fullname).trim(),

          email:
            normalizedEmail,

          phone:
            phone
              ? String(phone).trim()
              : "",

          company:
            company
              ? String(company).trim()
              : "",

          location:
            location
              ? String(location).trim()
              : "",
        }
      );

    if (!jobHolder) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Job Holder updated successfully",
      jobHolder,
    });

  } catch (error) {
    console.error(
      "UPDATE JOB HOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update Job Holder",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE JOB HOLDER
// DELETE /api/jobholder/:id
// =====================================================

const deleteJobHolder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Job Holder ID is required",
      });
    }

    const deleted =
      await jobHolderModel.deleteJobHolder(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Job Holder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Job Holder deleted successfully",
      deletedUserId:
        deleted.id,
    });

  } catch (error) {
    console.error(
      "DELETE JOB HOLDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete Job Holder",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
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
};