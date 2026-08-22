const pool = require("../../db");
const bcrypt = require("bcrypt");


const calculateProfileCompletion = ({
  user,
  resume,
  skills = [],
  experience = [],
  education = [],
}) => {
  let completed = 0;
  const total = 10;

  // 1. Full name
  if (user?.fullname || resume?.name) {
    completed++;
  }

  // 2. Email
  if (user?.email || resume?.email) {
    completed++;
  }

  // 3. Phone
  if (user?.phone || resume?.phone) {
    completed++;
  }

  // 4. Role
  if (user?.role || resume?.role) {
    completed++;
  }

  // 5. Location
  if (resume?.location?.trim()) {
    completed++;
  }

  // 6. Summary
  if (resume?.summary?.trim()) {
    completed++;
  }

  // 7. Skills
  if (Array.isArray(skills) && skills.length > 0) {
    completed++;
  }

  // 8. Experience
  if (Array.isArray(experience) && experience.length > 0) {
    completed++;
  }

  // 9. Education
  if (Array.isArray(education) && education.length > 0) {
    completed++;
  }

  // 10. Resume record
  if (resume) {
    completed++;
  }

  return Math.round((completed / total) * 100);
};


// =====================================================
// HELPER - CREATE NOTIFICATION
// =====================================================



// =====================================================
// DASHBOARD
// =====================================================

const createNotification = async ({
  email,
  type = "system",
  title,
  message,
}) => {
  try {
    if (!email || !title || !message) {
      return null;
    }

    const result = await pool.query(
      `
      INSERT INTO notifications
      (
        email,
        type,
        title,
        message,
        is_read,
        created_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        FALSE,
        CURRENT_TIMESTAMP
      )
      RETURNING *
      `,
      [
        email.trim(),
        type,
        title,
        message,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "Notification Error:",
      error.message
    );

    // Notification failure should not break main request
    return null;
  }
};

// =====================================================
// HELPER - APPLICATION STATUS NOTIFICATION
// =====================================================

const createApplicationStatusNotification = async ({
  email,
  jobTitle,
  company,
  status,
}) => {
  try {
    if (!email) {
      return null;
    }

    const normalizedStatus = String(status || "")
      .trim()
      .toLowerCase();

    let title = "Application Status Updated";

    let message = `Your application for ${
      jobTitle || "the job"
    } has been updated.`;

    if (normalizedStatus === "shortlisted") {
      title = "Application Shortlisted";

      message = `Good news! Your application for ${
        jobTitle || "the job"
      } at ${
        company || "the company"
      } has been shortlisted.`;
    }

    if (
      normalizedStatus === "interview" ||
      normalizedStatus === "interview scheduled"
    ) {
      title = "Interview Scheduled";

      message = `Your application for ${
        jobTitle || "the job"
      } at ${
        company || "the company"
      } has been selected for an interview.`;
    }

    if (normalizedStatus === "rejected") {
      title = "Application Status Updated";

      message = `Your application for ${
        jobTitle || "the job"
      } at ${
        company || "the company"
      } has not been selected at this time.`;
    }

    if (normalizedStatus === "accepted") {
      title = "Application Accepted";

      message = `Congratulations! Your application for ${
        jobTitle || "the job"
      } at ${
        company || "the company"
      } has been accepted.`;
    }

    return createNotification({
      email,
      type: "application",
      title,
      message,
    });
  } catch (error) {
    console.error(
      "APPLICATION STATUS NOTIFICATION ERROR:",
      error.message
    );

    return null;
  }
};

// =====================================================
// TEST
// GET /api/jobseeker/test
// =====================================================

const test = async (req, res) => {
  return res.json({
    success: true,
    message: "JobSeeker route is working",
  });
};

// =====================================================
// DASHBOARD
// GET /api/jobseeker/dashboard?email=xxx
// =====================================================

const getDashboard = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim();

    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        role
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -------------------------------------------------
    // TOTAL APPLICATIONS
    // -------------------------------------------------

    const applicationsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM applications
      WHERE LOWER(email) = LOWER($1)
      `,
      [cleanEmail]
    );

    const totalApplications =
      applicationsResult.rows[0]?.total || 0;

    // -------------------------------------------------
    // ACCEPTED
    // -------------------------------------------------

    const acceptedResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM applications
      WHERE LOWER(email) = LOWER($1)
      AND LOWER(COALESCE(status, 'pending')) = 'accepted'
      `,
      [cleanEmail]
    );

    const acceptedApplications =
      acceptedResult.rows[0]?.total || 0;

    // -------------------------------------------------
    // REJECTED
    // -------------------------------------------------

    const rejectedResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM applications
      WHERE LOWER(email) = LOWER($1)
      AND LOWER(COALESCE(status, 'pending')) = 'rejected'
      `,
      [cleanEmail]
    );

    const rejectedApplications =
      rejectedResult.rows[0]?.total || 0;

    // -------------------------------------------------
    // INTERVIEW APPLICATIONS
    // -------------------------------------------------

    const interviewResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM applications
      WHERE LOWER(email) = LOWER($1)
      AND LOWER(COALESCE(status, 'pending'))
      IN ('interview', 'interview scheduled')
      `,
      [cleanEmail]
    );

    const interviewApplications =
      interviewResult.rows[0]?.total || 0;

    // -------------------------------------------------
    // SHORTLISTED
    // -------------------------------------------------

    const shortlistedResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM applications
      WHERE LOWER(email) = LOWER($1)
      AND LOWER(COALESCE(status, 'pending'))
      IN ('accepted', 'shortlisted')
      `,
      [cleanEmail]
    );

    const shortlistedApplications =
      shortlistedResult.rows[0]?.total || 0;

    // -------------------------------------------------
    // SAVED JOBS
    // -------------------------------------------------

    const savedResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM saved_jobs
      WHERE LOWER(email) = LOWER($1)
      `,
      [cleanEmail]
    );

    const savedJobs =
      savedResult.rows[0]?.total || 0;

    // -------------------------------------------------
    // UPCOMING INTERVIEWS
    // -------------------------------------------------

    const interviewsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM interviews i
      INNER JOIN applications a
        ON i.application_id = a.id
      WHERE LOWER(a.email) = LOWER($1)
      AND i.interview_date >= CURRENT_DATE
      `,
      [cleanEmail]
    );

    const upcomingInterviews =
      interviewsResult.rows[0]?.total || 0;

    // -------------------------------------------------
    // RECENT JOBS
    // -------------------------------------------------

    const recentJobsResult = await pool.query(
      `
      SELECT *
      FROM jobs
      ORDER BY id DESC
      LIMIT 5
      `
    );

    // -------------------------------------------------
    // APPLICATION STATUS
    // -------------------------------------------------

    const statusResult = await pool.query(
      `
      SELECT
        LOWER(COALESCE(status, 'pending')) AS status,
        COUNT(*)::int AS count
      FROM applications
      WHERE LOWER(email) = LOWER($1)
      GROUP BY LOWER(COALESCE(status, 'pending'))
      `,
      [cleanEmail]
    );

    const applicationStatus = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
    };

    statusResult.rows.forEach((row) => {
      const status = row.status;

      if (
        status === "pending" ||
        status === "applied"
      ) {
        applicationStatus.applied += row.count;
      }

      if (
        status === "accepted" ||
        status === "shortlisted"
      ) {
        applicationStatus.shortlisted += row.count;
      }

      if (
        status === "interview" ||
        status === "interview scheduled"
      ) {
        applicationStatus.interview += row.count;
      }

      if (status === "rejected") {
        applicationStatus.rejected += row.count;
      }
    });

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    const stats = {
      totalApplications,
      acceptedApplications,
      rejectedApplications,
      interviewApplications,
      shortlistedApplications,
      savedJobs,
      upcomingInterviews,
    };

    return res.json({
      success: true,
      user,

      stats,

      // Compatibility with older frontend
      totalApplications,
      savedJobs,
      upcomingInterviews,

      profileCompletion: 0,

      recentJobs: recentJobsResult.rows,

      applicationStatus,
    });
  } catch (error) {
    console.error(
      "JOB SEEKER DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// =====================================================
// GET APPLICATIONS
// GET /api/jobseeker/applications?email=xxx
// =====================================================

const getApplications = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim();

    const userResult = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        role
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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
        COALESCE(a.status, 'Pending') AS status,
        a.applied_at,

        j.title AS job_title,
        j.title AS position,
        j.company,
        j.location,
        j.salary,
        j.experience AS job_experience,
        j.job_type,
        j.category,
        j.department,
        j.education,
        j.vacancies,
        j.skills,
        j.description,
        j.responsibilities,
        j.benefits,
        j.last_date,
        j.status AS job_status

      FROM applications a

      LEFT JOIN jobs j
        ON a.job_id = j.id

      WHERE LOWER(a.email) = LOWER($1)

      ORDER BY
        a.applied_at DESC NULLS LAST,
        a.id DESC
      `,
      [cleanEmail]
    );

    return res.json({
      success: true,
      applications: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error(
      "GET JOB SEEKER APPLICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// =====================================================
// GET SHORTLIST
// GET /api/jobseeker/shortlist?email=xxx
// =====================================================

const getShortlist = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

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
        COALESCE(a.status, 'Pending') AS status,
        a.applied_at,

        j.title AS job_title,
        j.company,
        j.location,
        j.salary,
        j.job_type,
        j.category,
        j.description

      FROM applications a

      LEFT JOIN jobs j
        ON a.job_id = j.id

      WHERE LOWER(a.email) = LOWER($1)

      AND LOWER(
        COALESCE(a.status, 'pending')
      ) IN (
        'accepted',
        'shortlisted',
        'interview',
        'interview scheduled'
      )

      ORDER BY
        a.applied_at DESC NULLS LAST,
        a.id DESC
      `,
      [email.trim()]
    );

    return res.json({
      success: true,
      applications: result.rows,
      shortlist: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error(
      "GET SHORTLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shortlist",
      error: error.message,
    });
  }
};

// =====================================================
// GET REJECTED
// GET /api/jobseeker/rejected?email=xxx
// =====================================================

const getRejectedApplications = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

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
        COALESCE(a.status, 'Rejected') AS status,
        a.applied_at,

        j.title AS job_title,
        j.company,
        j.location,
        j.salary,
        j.job_type,
        j.category

      FROM applications a

      LEFT JOIN jobs j
        ON a.job_id = j.id

      WHERE LOWER(a.email) = LOWER($1)

      AND LOWER(
        COALESCE(a.status, 'pending')
      ) = 'rejected'

      ORDER BY
        a.applied_at DESC NULLS LAST,
        a.id DESC
      `,
      [email.trim()]
    );

    return res.json({
      success: true,
      applications: result.rows,
      rejected: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error(
      "GET REJECTED APPLICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rejected applications",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE APPLICATION
// GET /api/jobseeker/applications/:id?email=xxx
// =====================================================

const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid application ID is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        a.*,

        j.title AS job_title,
        j.company,
        j.location,
        j.salary,
        j.job_type,
        j.category,
        j.description,
        j.experience AS job_experience,
        j.skills,
        j.responsibilities,
        j.benefits,
        j.education,
        j.vacancies,
        j.last_date

      FROM applications a

      LEFT JOIN jobs j
        ON a.job_id = j.id

      WHERE a.id = $1
      AND LOWER(a.email) = LOWER($2)
      `,
      [
        Number(id),
        email.trim(),
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.json({
      success: true,
      application: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET APPLICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
      error: error.message,
    });
  }
};

// =====================================================
// APPLY FOR JOB
// POST /api/jobseeker/apply
// =====================================================

const applyForJob = async (req, res) => {
  try {
    const {
      job_id,
      applicant_name,
      applicantName,
      email,
      applicant_email,
      applicantEmail,
      phone,
      experience,
      resume,
    } = req.body;

    const finalApplicantName =
      applicant_name ||
      applicantName ||
      "";

    const finalEmail =
      email ||
      applicant_email ||
      applicantEmail ||
      "";

    if (
      !job_id ||
      !finalApplicantName.trim() ||
      !finalEmail.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Job ID, applicant name and email are required",
      });
    }

    // -------------------------------------------------
    // CHECK JOB
    // -------------------------------------------------

    const jobResult = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE id = $1
      LIMIT 1
      `,
      [Number(job_id)]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const job = jobResult.rows[0];

    // -------------------------------------------------
    // CHECK DUPLICATE
    // -------------------------------------------------

    const existingResult = await pool.query(
      `
      SELECT
        id,
        status
      FROM applications
      WHERE job_id = $1
      AND LOWER(email) = LOWER($2)
      LIMIT 1
      `,
      [
        Number(job_id),
        finalEmail.trim(),
      ]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You have already applied for this job.",
        application: existingResult.rows[0],
      });
    }

    // -------------------------------------------------
    // INSERT
    // -------------------------------------------------

    const result = await pool.query(
      `
      INSERT INTO applications
      (
        job_id,
        applicant_name,
        email,
        phone,
        experience,
        resume,
        status,
        applied_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'Pending',
        CURRENT_TIMESTAMP
      )
      RETURNING *
      `,
      [
        Number(job_id),
        finalApplicantName.trim(),
        finalEmail.trim(),
        phone || null,
        experience || null,
        resume || null,
      ]
    );

    // -------------------------------------------------
    // NOTIFICATION
    // -------------------------------------------------

    await createNotification({
      email: finalEmail.trim(),
      type: "application",
      title: "Application Submitted",
      message:
        `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error(
      "APPLY JOB ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

// =====================================================
// GET SAVED JOBS
// GET /api/jobseeker/saved-jobs?email=xxx
// =====================================================

const getSavedJobs = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        sj.id AS saved_id,
        sj.email,
        sj.job_id,

        j.title,
        j.company,
        j.location,
        j.salary,
        j.experience,
        j.job_type,
        j.category,
        j.description,
        j.status AS job_status

      FROM saved_jobs sj

      INNER JOIN jobs j
        ON sj.job_id = j.id

      WHERE LOWER(sj.email) = LOWER($1)

      ORDER BY sj.id DESC
      `,
      [email.trim()]
    );

    return res.json({
      success: true,
      savedJobs: result.rows,
      jobs: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error(
      "GET SAVED JOBS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs",
      error: error.message,
    });
  }
};

// =====================================================
// SAVE JOB
// POST /api/jobseeker/saved-jobs
// =====================================================

const saveJob = async (req, res) => {
  try {
    const { email, job_id } = req.body;

    if (!email || !job_id) {
      return res.status(400).json({
        success: false,
        message: "Email and job ID are required",
      });
    }

    const cleanEmail = email.trim();
    const numericJobId = Number(job_id);

    if (isNaN(numericJobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // -------------------------------------------------
    // CHECK JOB
    // -------------------------------------------------

    const jobResult = await pool.query(
      `
      SELECT id
      FROM jobs
      WHERE id = $1
      LIMIT 1
      `,
      [numericJobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // -------------------------------------------------
    // CHECK EXISTING
    // -------------------------------------------------

    const existing = await pool.query(
      `
      SELECT id
      FROM saved_jobs
      WHERE LOWER(email) = LOWER($1)
      AND job_id = $2
      LIMIT 1
      `,
      [
        cleanEmail,
        numericJobId,
      ]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        message: "Job already saved",
        saved: true,
      });
    }

    // -------------------------------------------------
    // INSERT
    // -------------------------------------------------

    const result = await pool.query(
      `
      INSERT INTO saved_jobs
      (
        email,
        job_id
      )
      VALUES
      (
        $1,
        $2
      )
      RETURNING *
      `,
      [
        cleanEmail,
        numericJobId,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Job saved successfully",
      saved: true,
      savedJob: result.rows[0],
    });
  } catch (error) {
    console.error(
      "SAVE JOB ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save job",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE SAVED JOB
// DELETE /api/jobseeker/saved-jobs
// =====================================================

const removeSavedJob = async (req, res) => {
  try {
    const { email, job_id } = req.body;

    if (!email || !job_id) {
      return res.status(400).json({
        success: false,
        message: "Email and job ID are required",
      });
    }

    const numericJobId = Number(job_id);

    if (isNaN(numericJobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM saved_jobs
      WHERE LOWER(email) = LOWER($1)
      AND job_id = $2
      RETURNING *
      `,
      [
        email.trim(),
        numericJobId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
    }

    return res.json({
      success: true,
      message: "Job removed from saved jobs",
      removedJob: result.rows[0],
    });
  } catch (error) {
    console.error(
      "REMOVE SAVED JOB ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove saved job",
      error: error.message,
    });
  }
};

// =====================================================
// GET INTERVIEWS
// GET /api/jobseeker/interviews?email=xxx
// =====================================================

const getInterviews = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

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

        a.applicant_name,
        a.email,
        a.status AS application_status,

        j.id AS job_id,
        j.title AS job_title,
        j.company,
        j.location,
        j.salary

      FROM interviews i

      INNER JOIN applications a
        ON i.application_id = a.id

      LEFT JOIN jobs j
        ON a.job_id = j.id

      WHERE LOWER(a.email) = LOWER($1)

      ORDER BY
        i.interview_date ASC NULLS LAST,
        i.interview_time ASC NULLS LAST,
        i.id DESC
      `,
      [email.trim()]
    );

    const interviews = result.rows.map(
      (interview) => {
        let canJoin = false;

        if (
          interview.interview_type &&
          interview.interview_type
            .toLowerCase()
            .includes("online")
        ) {
          canJoin = true;
        }

        return {
          ...interview,
          canJoin,
        };
      }
    );

    return res.json({
      success: true,
      interviews,
      total: interviews.length,
    });
  } catch (error) {
    console.error(
      "GET INTERVIEWS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
      error: error.message,
    });
  }
};

// =====================================================
// GET NOTIFICATIONS
// GET /api/jobseeker/notifications?email=xxx
// =====================================================

const getNotifications = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        email,
        type,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE LOWER(email) = LOWER($1)
      ORDER BY
        created_at DESC,
        id DESC
      `,
      [email.trim()]
    );

    return res.json({
      success: true,
      notifications: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// =====================================================
// MARK NOTIFICATION AS READ
// PUT /api/jobseeker/notifications/:id/read
// =====================================================

const markNotificationRead = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      AND LOWER(email) = LOWER($2)
      RETURNING *
      `,
      [
        Number(id),
        email.trim(),
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error(
      "MARK NOTIFICATION READ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// =====================================================
// UNREAD NOTIFICATION COUNT
// GET /api/jobseeker/notifications/unread-count?email=xxx
// =====================================================

const getUnreadNotificationCount = async (
  req,
  res
) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE LOWER(email) = LOWER($1)
      AND is_read = FALSE
      `,
      [email.trim()]
    );

    return res.json({
      success: true,
      count: result.rows[0]?.count || 0,
    });
  } catch (error) {
    console.error(
      "UNREAD NOTIFICATION COUNT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications",
      error: error.message,
    });
  }
};

// =====================================================
// GET ASSESSMENTS
// GET /api/jobseeker/assessments
// =====================================================

const getAssessments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM assessments
      ORDER BY id ASC
      `
    );

    return res.json({
      success: true,
      assessments: result.rows,
    });
  } catch (error) {
    console.error(
      "GET ASSESSMENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assessments",
      error: error.message,
    });
  }
};

// =====================================================
// GET ASSESSMENT QUESTIONS
// GET /api/jobseeker/assessments/:assessmentId/questions
// =====================================================

const getAssessmentQuestions = async (
  req,
  res
) => {
  try {
    const { assessmentId } = req.params;

    if (
      !assessmentId ||
      isNaN(Number(assessmentId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM assessment_questions
      WHERE assessment_id = $1
      ORDER BY id ASC
      `,
      [Number(assessmentId)]
    );

    return res.json({
      success: true,
      questions: result.rows,
    });
  } catch (error) {
    console.error(
      "GET ASSESSMENT QUESTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assessment questions",
      error: error.message,
    });
  }
};

// =====================================================
// SAVE ASSESSMENT RESULT
// POST /api/jobseeker/assessment-results
// =====================================================

const saveAssessmentResult = async (
  req,
  res
) => {
  try {
    const {
      email,
      assessment_id,
      score,
      total_questions,
    } = req.body;

    if (
      !email ||
      !email.trim() ||
      !assessment_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and assessment ID are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO assessment_results
      (
        email,
        assessment_id,
        score,
        total_questions
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING *
      `,
      [
        email.trim(),
        assessment_id,
        score || 0,
        total_questions || 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Assessment result saved successfully",
      result: result.rows[0],
    });
  } catch (error) {
    console.error(
      "SAVE ASSESSMENT RESULT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save assessment result",
      error: error.message,
    });
  }
};

// =====================================================
// GET RESUME
// GET /api/jobseeker/resume?email=xxx
// =====================================================

const getResume = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim();

    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        role
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -------------------------------------------------
    // MAIN RESUME
    // -------------------------------------------------

    let resume = null;

    try {
      const resumeResult = await pool.query(
        `
        SELECT *
        FROM resumes
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [cleanEmail]
      );

      if (resumeResult.rows.length > 0) {
        resume = resumeResult.rows[0];
      }
    } catch (error) {
      console.error(
        "Resume table query error:",
        error.message
      );
    }

    // -------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------

    let experience = [];

    if (resume) {
      try {
        const experienceResult =
          await pool.query(
            `
            SELECT
              id,
              resume_id,
              role,
              company,
              duration,
              description
            FROM resume_experience
            WHERE resume_id = $1
            ORDER BY id ASC
            `,
            [resume.id]
          );

        experience = experienceResult.rows;
      } catch (error) {
        console.error(
          "Resume experience query error:",
          error.message
        );
      }
    }

    // -------------------------------------------------
    // EDUCATION
    // -------------------------------------------------

    let education = [];

    if (resume) {
      try {
        const educationResult =
          await pool.query(
            `
            SELECT
              id,
              resume_id,
              degree,
              institution,
              year
            FROM resume_education
            WHERE resume_id = $1
            ORDER BY id ASC
            `,
            [resume.id]
          );

        education = educationResult.rows;
      } catch (error) {
        console.error(
          "Resume education query error:",
          error.message
        );
      }
    }

    // -------------------------------------------------
    // SKILLS
    // -------------------------------------------------

    let skills = [];

    if (resume?.skills) {
      if (Array.isArray(resume.skills)) {
        skills = resume.skills;
      } else if (
        typeof resume.skills === "string"
      ) {
        try {
          const parsedSkills =
            JSON.parse(resume.skills);

          if (Array.isArray(parsedSkills)) {
            skills = parsedSkills;
          }
        } catch {
          skills = [];
        }
      }
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,

      resume: resume
        ? {
            ...resume,

            name:
              resume.name ||
              user.fullname ||
              "",

            role:
              resume.role ||
              user.role ||
              "",

            email:
              resume.email ||
              user.email ||
              "",

            phone:
              resume.phone ||
              user.phone ||
              "",

            location:
              resume.location || "",

            summary:
              resume.summary || "",

            skills,
          }
        : {
            name: user.fullname || "",
            role: user.role || "",
            email: user.email || "",
            phone: user.phone || "",
            location: "",
            summary: "",
            skills: [],
          },

      experience,
      education,
    });
  } catch (error) {
    console.error(
      "GET RESUME ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};

// =====================================================
// SAVE / UPDATE RESUME
// PUT /api/jobseeker/resume
// =====================================================

const saveResume = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      email,
      name,
      role,
      phone,
      location,
      summary,
      skills,
      experience,
      education,
    } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim();

    await client.query("BEGIN");

    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    const userResult = await client.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        role
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -------------------------------------------------
    // MAIN RESUME
    // -------------------------------------------------

    const resumeResult = await client.query(
      `
      INSERT INTO resumes
      (
        email,
        name,
        role,
        phone,
        location,
        summary,
        skills,
        updated_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location,
        summary = EXCLUDED.summary,
        skills = EXCLUDED.skills,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        cleanEmail,
        name || user.fullname || "",
        role || user.role || "",
        phone || user.phone || null,
        location || "",
        summary || "",
        JSON.stringify(
          Array.isArray(skills)
            ? skills
            : []
        ),
      ]
    );

    const resumeId =
      resumeResult.rows[0].id;

    // -------------------------------------------------
    // DELETE OLD EXPERIENCE
    // -------------------------------------------------

    await client.query(
      `
      DELETE FROM resume_experience
      WHERE resume_id = $1
      `,
      [resumeId]
    );

    // -------------------------------------------------
    // INSERT EXPERIENCE
    // -------------------------------------------------

    if (Array.isArray(experience)) {
      for (const item of experience) {
        if (
          !item ||
          (!item.role && !item.company)
        ) {
          continue;
        }

        await client.query(
          `
          INSERT INTO resume_experience
          (
            resume_id,
            role,
            company,
            duration,
            description
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5
          )
          `,
          [
            resumeId,
            item.role || "",
            item.company || "",
            item.duration || "",
            item.description || "",
          ]
        );
      }
    }

    // -------------------------------------------------
    // DELETE OLD EDUCATION
    // -------------------------------------------------

    await client.query(
      `
      DELETE FROM resume_education
      WHERE resume_id = $1
      `,
      [resumeId]
    );

    // -------------------------------------------------
    // INSERT EDUCATION
    // -------------------------------------------------

    if (Array.isArray(education)) {
      for (const item of education) {
        if (
          !item ||
          (!item.degree &&
            !item.institution &&
            !item.year)
        ) {
          continue;
        }

        await client.query(
          `
          INSERT INTO resume_education
          (
            resume_id,
            degree,
            institution,
            year
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
            resumeId,
            item.degree || "",
            item.institution || "",
            item.year || "",
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: "Resume saved successfully",
      resume: resumeResult.rows[0],
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback Error:",
        rollbackError.message
      );
    }

    console.error(
      "SAVE RESUME ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save resume",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// =====================================================
// GET PROFILE BY EMAIL
// GET /api/jobseeker/profile?email=xxx
// =====================================================

const getProfile = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim();

    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        role
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -------------------------------------------------
    // RESUME
    // -------------------------------------------------

    let resume = null;

    const resumeResult = await pool.query(
      `
      SELECT
        id,
        email,
        name,
        role,
        phone,
        location,
        summary,
        skills,
        updated_at
      FROM resumes
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (resumeResult.rows.length > 0) {
      resume = resumeResult.rows[0];
    }

    // -------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------

    let experience = [];

    if (resume) {
      const experienceResult =
        await pool.query(
          `
          SELECT
            id,
            resume_id,
            role,
            company,
            duration,
            description
          FROM resume_experience
          WHERE resume_id = $1
          ORDER BY id ASC
          `,
          [resume.id]
        );

      experience =
        experienceResult.rows;
    }

    // -------------------------------------------------
    // EDUCATION
    // -------------------------------------------------

    let education = [];

    if (resume) {
      const educationResult =
        await pool.query(
          `
          SELECT
            id,
            resume_id,
            degree,
            institution,
            year
          FROM resume_education
          WHERE resume_id = $1
          ORDER BY id ASC
          `,
          [resume.id]
        );

      education =
        educationResult.rows;
    }

    // -------------------------------------------------
    // SKILLS
    // -------------------------------------------------

    let skills = [];

    if (resume?.skills) {
      if (Array.isArray(resume.skills)) {
        skills = resume.skills;
      } else if (
        typeof resume.skills === "string"
      ) {
        try {
          const parsed =
            JSON.parse(resume.skills);

          if (Array.isArray(parsed)) {
            skills = parsed;
          }
        } catch {
          skills = [];
        }
      }
    }

    // -------------------------------------------------
    // PROFILE
    // -------------------------------------------------

    const profile = {
      id: user.id,

      fullname:
        resume?.name ||
        user.fullname ||
        "",

      name:
        resume?.name ||
        user.fullname ||
        "",

      email:
        resume?.email ||
        user.email ||
        "",

      phone:
        resume?.phone ||
        user.phone ||
        "",

      role:
        resume?.role ||
        user.role ||
        "",

      location:
        resume?.location ||
        "",

      summary:
        resume?.summary ||
        "",

      skills,

      experience,

      education,

      resume_id:
        resume?.id ||
        null,

      updated_at:
        resume?.updated_at ||
        null,
    };

    return res.json({
      success: true,
      profile,
      user,
      resume,
      experience,
      education,
    });
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
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
// GET COMPLETE PROFILE BY ID
// GET /api/jobseeker/profile/:id
// =====================================================

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [Number(id)]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -------------------------------------------------
    // RESUME
    // -------------------------------------------------

    const resumeResult = await pool.query(
      `
      SELECT
        id,
        email,
        name,
        role,
        phone,
        location,
        summary,
        skills,
        updated_at
      FROM resumes
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [user.email]
    );

    const resume =
      resumeResult.rows.length > 0
        ? resumeResult.rows[0]
        : null;

    // -------------------------------------------------
    // EXPERIENCE
    // -------------------------------------------------

    let experience = [];

    if (resume) {
      const experienceResult =
        await pool.query(
          `
          SELECT
            id,
            resume_id,
            role,
            company,
            duration,
            description
          FROM resume_experience
          WHERE resume_id = $1
          ORDER BY id ASC
          `,
          [resume.id]
        );

      experience =
        experienceResult.rows;
    }

    // -------------------------------------------------
    // EDUCATION
    // -------------------------------------------------

    let education = [];

    if (resume) {
      const educationResult =
        await pool.query(
          `
          SELECT
            id,
            resume_id,
            degree,
            institution,
            year
          FROM resume_education
          WHERE resume_id = $1
          ORDER BY id ASC
          `,
          [resume.id]
        );

      education =
        educationResult.rows;
    }

    // -------------------------------------------------
    // SKILLS
    // -------------------------------------------------

    let skills = [];

    if (resume?.skills) {
      if (Array.isArray(resume.skills)) {
        skills = resume.skills;
      } else if (
        typeof resume.skills === "string"
      ) {
        try {
          const parsed =
            JSON.parse(resume.skills);

          if (Array.isArray(parsed)) {
            skills = parsed;
          }
        } catch {
          skills = [];
        }
      }
    }

    // -------------------------------------------------
    // PROFILE
    // -------------------------------------------------

    const profile = {
      id: user.id,

      fullname:
        resume?.name ||
        user.fullname ||
        "",

      name:
        resume?.name ||
        user.fullname ||
        "",

      email:
        resume?.email ||
        user.email ||
        "",

      phone:
        resume?.phone ||
        user.phone ||
        "",

      role:
        resume?.role ||
        user.role ||
        "",

      location:
        resume?.location ||
        "",

      summary:
        resume?.summary ||
        "",

      skills,

      experience,

      education,

      resume_id:
        resume?.id ||
        null,

      updated_at:
        resume?.updated_at ||
        null,
    };

    return res.json({
      success: true,
      profile,
      user,
      resume,
      experience,
      education,
    });
  } catch (error) {
    console.error(
      "GET PROFILE BY ID ERROR:",
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
// UPDATE COMPLETE PROFILE
// PUT /api/jobseeker/profile/:id
// =====================================================

const updateProfile = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      fullname,
      name,
      email,
      phone,
      role,
      location,
      summary,
      skills,
      experience,
      education,
    } = req.body;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // -------------------------------------------------
    // VALIDATE BASIC DATA
    // -------------------------------------------------

    const finalName =
      fullname?.trim() ||
      name?.trim() ||
      "";

    const finalEmail =
      email?.trim() ||
      "";

    if (!finalName || !finalEmail) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    await client.query("BEGIN");

    // -------------------------------------------------
    // GET CURRENT USER
    // -------------------------------------------------

    const userResult = await client.query(
      `
      SELECT
        id,
        fullname,
        email,
        phone,
        role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [Number(id)]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser =
      userResult.rows[0];

    const oldEmail =
      currentUser.email;

    // -------------------------------------------------
    // CHECK EMAIL DUPLICATE
    // -------------------------------------------------

    const duplicateEmail =
      await client.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        AND id <> $2
        LIMIT 1
        `,
        [
          finalEmail,
          Number(id),
        ]
      );

    if (duplicateEmail.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message:
          "Email is already being used by another user",
      });
    }

    // -------------------------------------------------
    // UPDATE USER
    // -------------------------------------------------

    const updatedUserResult =
      await client.query(
        `
        UPDATE users
        SET
          fullname = $1,
          email = $2,
          phone = $3
        WHERE id = $4
        RETURNING
          id,
          fullname,
          email,
          phone,
          role
        `,
        [
          finalName,
          finalEmail,
          phone?.trim() || null,
          Number(id),
        ]
      );

    const updatedUser =
      updatedUserResult.rows[0];

    // -------------------------------------------------
    // PREPARE SKILLS
    // -------------------------------------------------

    const finalSkills =
      Array.isArray(skills)
        ? skills
        : [];

    // -------------------------------------------------
    // FIND EXISTING RESUME USING OLD EMAIL
    // -------------------------------------------------

    const existingResumeResult =
      await client.query(
        `
        SELECT id
        FROM resumes
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [oldEmail]
      );

    let resume;

    // -------------------------------------------------
    // UPDATE EXISTING RESUME
    // -------------------------------------------------

    if (
      existingResumeResult.rows.length > 0
    ) {
      const resumeId =
        existingResumeResult.rows[0].id;

      const resumeResult =
        await client.query(
          `
          UPDATE resumes
          SET
            email = $1,
            name = $2,
            role = $3,
            phone = $4,
            location = $5,
            summary = $6,
            skills = $7::jsonb,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
          RETURNING *
          `,
          [
            finalEmail,
            finalName,
            role?.trim() ||
              currentUser.role ||
              "",
            phone?.trim() ||
              currentUser.phone ||
              null,
            location?.trim() || "",
            summary?.trim() || "",
            JSON.stringify(finalSkills),
            resumeId,
          ]
        );

      resume =
        resumeResult.rows[0];
    } else {
      // -------------------------------------------------
      // CREATE NEW RESUME
      // -------------------------------------------------

      const resumeResult =
        await client.query(
          `
          INSERT INTO resumes
          (
            email,
            name,
            role,
            phone,
            location,
            summary,
            skills,
            updated_at
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7::jsonb,
            CURRENT_TIMESTAMP
          )
          RETURNING *
          `,
          [
            finalEmail,
            finalName,
            role?.trim() ||
              currentUser.role ||
              "",
            phone?.trim() ||
              currentUser.phone ||
              null,
            location?.trim() || "",
            summary?.trim() || "",
            JSON.stringify(finalSkills),
          ]
        );

      resume =
        resumeResult.rows[0];
    }

    const resumeId =
      resume.id;

    // -------------------------------------------------
    // DELETE OLD EXPERIENCE
    // -------------------------------------------------

    await client.query(
      `
      DELETE FROM resume_experience
      WHERE resume_id = $1
      `,
      [resumeId]
    );

    // -------------------------------------------------
    // SAVE EXPERIENCE
    // -------------------------------------------------

    if (Array.isArray(experience)) {
      for (const item of experience) {
        if (!item) continue;

        if (
          !item.role &&
          !item.company &&
          !item.duration &&
          !item.description
        ) {
          continue;
        }

        await client.query(
          `
          INSERT INTO resume_experience
          (
            resume_id,
            role,
            company,
            duration,
            description
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5
          )
          `,
          [
            resumeId,
            item.role || "",
            item.company || "",
            item.duration || "",
            item.description || "",
          ]
        );
      }
    }

    // -------------------------------------------------
    // DELETE OLD EDUCATION
    // -------------------------------------------------

    await client.query(
      `
      DELETE FROM resume_education
      WHERE resume_id = $1
      `,
      [resumeId]
    );

    // -------------------------------------------------
    // SAVE EDUCATION
    // -------------------------------------------------

    if (Array.isArray(education)) {
      for (const item of education) {
        if (!item) continue;

        if (
          !item.degree &&
          !item.institution &&
          !item.year
        ) {
          continue;
        }

        await client.query(
          `
          INSERT INTO resume_education
          (
            resume_id,
            degree,
            institution,
            year
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
            resumeId,
            item.degree || "",
            item.institution || "",
            item.year || "",
          ]
        );
      }
    }

    // -------------------------------------------------
    // COMMIT
    // -------------------------------------------------

    await client.query("COMMIT");

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      message: "Profile updated successfully",

      profile: {
        id: updatedUser.id,

        fullname:
          updatedUser.fullname,

        name:
          updatedUser.fullname,

        email:
          updatedUser.email,

        phone:
          updatedUser.phone || "",

        role:
          resume.role ||
          updatedUser.role ||
          "",

        location:
          resume.location ||
          "",

        summary:
          resume.summary ||
          "",

        skills:
          finalSkills,

        experience:
          Array.isArray(experience)
            ? experience
            : [],

        education:
          Array.isArray(education)
            ? education
            : [],

        resume_id:
          resume.id,

        updated_at:
          resume.updated_at,
      },

      user: updatedUser,

      resume,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "ROLLBACK ERROR:",
        rollbackError.message
      );
    }

    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// =====================================================
// CHANGE JOB SEEKER PASSWORD
// PUT /api/jobseeker/profile/:id/change-password
// =====================================================

const changeJobSeekerPassword = async (
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

    // -------------------------------------------------
    // VALIDATE USER ID
    // -------------------------------------------------

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // -------------------------------------------------
    // VALIDATE PASSWORD FIELDS
    // -------------------------------------------------

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All password fields are required",
      });
    }

    // -------------------------------------------------
    // PASSWORD LENGTH
    // -------------------------------------------------

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters",
      });
    }

    // -------------------------------------------------
    // CONFIRM PASSWORD
    // -------------------------------------------------

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    // -------------------------------------------------
    // PREVENT SAME PASSWORD
    // -------------------------------------------------

    if (
      currentPassword === newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // -------------------------------------------------
    // GET USER
    // -------------------------------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        password
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [Number(id)]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user =
      userResult.rows[0];

    if (!user.password) {
      return res.status(500).json({
        success: false,
        message:
          "User password is not configured",
      });
    }

    // -------------------------------------------------
    // CHECK CURRENT PASSWORD
    // -------------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // -------------------------------------------------
    // HASH NEW PASSWORD
    // -------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // -------------------------------------------------
    // UPDATE PASSWORD
    // -------------------------------------------------

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [
        hashedPassword,
        Number(id),
      ]
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "JOB SEEKER CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  // Test
  test,

  // Dashboard
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
  createNotification,
  createApplicationStatusNotification,
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
};