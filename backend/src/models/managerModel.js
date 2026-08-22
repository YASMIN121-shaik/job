const pool = require("../../db");
const bcrypt = require("bcryptjs");

// =====================================================
// HELPER - CHECK COLUMN
// =====================================================

const columnExists = async (tableName, columnName) => {
  const result = await pool.query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
    ) AS exists
    `,
    [tableName, columnName]
  );

  return result.rows[0].exists;
};

// =====================================================
// HELPER - CHECK TABLE
// =====================================================

const tableExists = async (tableName) => {
  const result = await pool.query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    ) AS exists
    `,
    [tableName]
  );

  return result.rows[0].exists;
};

// =====================================================
// CREATE MANAGER
// =====================================================

const createManager = async ({
  fullname,
  email,
  phone,
  company,
  designation,
  location,
  password,
}) => {
  const cleanFullname = fullname.trim();
  const cleanEmail = email.trim().toLowerCase();

  const hashedPassword = await bcrypt.hash(password, 10);

  const hasPhone = await columnExists("users", "phone");
  const hasCompany = await columnExists("users", "company");
  const hasDesignation = await columnExists(
    "users",
    "designation"
  );
  const hasLocation = await columnExists(
    "users",
    "location"
  );

  const columns = [
    "fullname",
    "email",
    "password",
    "role",
  ];

  const values = [
    cleanFullname,
    cleanEmail,
    hashedPassword,
  ];

  const placeholders = [
    "$1",
    "$2",
    "$3",
    "'manager'",
  ];

  let index = 4;

  if (hasPhone) {
    columns.push("phone");
    values.push(phone ? phone.trim() : "");
    placeholders.push(`$${index++}`);
  }

  if (hasCompany) {
    columns.push("company");
    values.push(company ? company.trim() : "");
    placeholders.push(`$${index++}`);
  }

  if (hasDesignation) {
    columns.push("designation");
    values.push(
      designation ? designation.trim() : ""
    );
    placeholders.push(`$${index++}`);
  }

  if (hasLocation) {
    columns.push("location");
    values.push(
      location ? location.trim() : ""
    );
    placeholders.push(`$${index++}`);
  }

  const result = await pool.query(
    `
    INSERT INTO users
    (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *
    `,
    values
  );

  return result.rows[0];
};

// =====================================================
// FIND MANAGER BY EMAIL
// =====================================================

const findManagerByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
    AND LOWER(TRIM(role)) = 'manager'
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
};

// =====================================================
// GET ALL MANAGERS
// =====================================================

const getAllManagers = async () => {
  const hasPhone = await columnExists("users", "phone");
  const hasCompany = await columnExists("users", "company");
  const hasDesignation = await columnExists(
    "users",
    "designation"
  );
  const hasLocation = await columnExists(
    "users",
    "location"
  );

  const fields = [
    "id",
    "fullname",
    "email",
    "role",
  ];

  if (hasPhone) fields.push("phone");
  if (hasCompany) fields.push("company");
  if (hasDesignation) fields.push("designation");
  if (hasLocation) fields.push("location");

  const result = await pool.query(
    `
    SELECT ${fields.join(", ")}
    FROM users
    WHERE LOWER(TRIM(role)) = 'manager'
    ORDER BY id DESC
    `
  );

  return result.rows;
};

// =====================================================
// GET MANAGER BY ID
// =====================================================

const getManagerById = async (id) => {
  const hasPhone = await columnExists("users", "phone");
  const hasCompany = await columnExists("users", "company");
  const hasDesignation = await columnExists(
    "users",
    "designation"
  );
  const hasLocation = await columnExists(
    "users",
    "location"
  );

  const fields = [
    "id",
    "fullname",
    "email",
    "role",
  ];

  if (hasPhone) fields.push("phone");
  if (hasCompany) fields.push("company");
  if (hasDesignation) fields.push("designation");
  if (hasLocation) fields.push("location");

  const result = await pool.query(
    `
    SELECT ${fields.join(", ")}
    FROM users
    WHERE id = $1
    AND LOWER(TRIM(role)) = 'manager'
    `,
    [id]
  );

  return result.rows[0] || null;
};

// =====================================================
// UPDATE MANAGER
// =====================================================

const updateManager = async ({
  id,
  fullname,
  email,
  phone,
  company,
  designation,
  location,
}) => {
  const hasPhone = await columnExists("users", "phone");
  const hasCompany = await columnExists("users", "company");
  const hasDesignation = await columnExists(
    "users",
    "designation"
  );
  const hasLocation = await columnExists(
    "users",
    "location"
  );

  const updates = [
    "fullname = $1",
    "email = $2",
  ];

  const values = [
    fullname.trim(),
    email.trim().toLowerCase(),
  ];

  let index = 3;

  if (hasPhone) {
    updates.push(`phone = $${index++}`);
    values.push(phone ? phone.trim() : "");
  }

  if (hasCompany) {
    updates.push(`company = $${index++}`);
    values.push(company ? company.trim() : "");
  }

  if (hasDesignation) {
    updates.push(`designation = $${index++}`);
    values.push(
      designation ? designation.trim() : ""
    );
  }

  if (hasLocation) {
    updates.push(`location = $${index++}`);
    values.push(
      location ? location.trim() : ""
    );
  }

  values.push(id);

  const result = await pool.query(
    `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${index}
    AND LOWER(TRIM(role)) = 'manager'
    RETURNING *
    `,
    values
  );

  return result.rows[0] || null;
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async ({
  id,
  currentPassword,
  newPassword,
}) => {
  const result = await pool.query(
    `
    SELECT id, password
    FROM users
    WHERE id = $1
    AND LOWER(TRIM(role)) = 'manager'
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return {
      success: false,
      message: "Manager not found",
    };
  }

  const manager = result.rows[0];

  const passwordMatch = await bcrypt.compare(
    currentPassword,
    manager.password
  );

  if (!passwordMatch) {
    return {
      success: false,
      message: "Current password is incorrect",
    };
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE id = $2
    AND LOWER(TRIM(role)) = 'manager'
    `,
    [hashedPassword, id]
  );

  return {
    success: true,
    message: "Password changed successfully",
  };
};

// =====================================================
// DELETE MANAGER
// =====================================================

const deleteManager = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    AND LOWER(TRIM(role)) = 'manager'
    RETURNING id
    `,
    [id]
  );

  return result.rows[0] || null;
};

// =====================================================
// DASHBOARD - TOTAL JOBS
// =====================================================

const getTotalJobs = async () => {
  if (!(await tableExists("jobs"))) {
    return 0;
  }

  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM jobs
    `
  );

  return result.rows[0].count;
};

// =====================================================
// DASHBOARD - APPLICATION COUNT
// =====================================================

const getApplicationCount = async () => {
  if (!(await tableExists("applications"))) {
    return 0;
  }

  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM applications
    `
  );

  return result.rows[0].count;
};

// =====================================================
// DASHBOARD - RECENT APPLICANTS
// =====================================================

const getRecentApplicants = async () => {
  const applicationsExists = await tableExists(
    "applications"
  );

  if (!applicationsExists) {
    return [];
  }

  const jobsExists = await tableExists("jobs");

  if (!jobsExists) {
    const result = await pool.query(
      `
      SELECT *
      FROM applications
      ORDER BY id DESC
      LIMIT 5
      `
    );

    return result.rows;
  }

  const hasJobTitle = await columnExists(
    "jobs",
    "title"
  );

  const hasCompanyName = await columnExists(
    "jobs",
    "company_name"
  );

  const hasCompany = await columnExists(
    "jobs",
    "company"
  );

  let companyExpression = "NULL::text";

  if (hasCompanyName) {
    companyExpression = "j.company_name";
  } else if (hasCompany) {
    companyExpression = "j.company";
  }

  const titleExpression = hasJobTitle
    ? "j.title"
    : "NULL::text";

  const result = await pool.query(
    `
    SELECT
      a.*,
      ${titleExpression} AS job_title,
      ${companyExpression} AS job_company
    FROM applications a
    LEFT JOIN jobs j
      ON a.job_id = j.id
    ORDER BY a.id DESC
    LIMIT 5
    `
  );

  return result.rows;
};

// =====================================================
// DASHBOARD - INTERVIEW COUNT
// =====================================================

const getInterviewCount = async () => {
  if (!(await tableExists("interviews"))) {
    return 0;
  }

  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM interviews
    `
  );

  return result.rows[0].count;
};

// =====================================================
// DASHBOARD - RECRUITER COUNT
// =====================================================

const getRecruiterCount = async () => {
  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM users
    WHERE LOWER(TRIM(role))
    IN ('job_holder', 'recruiter')
    `
  );

  return result.rows[0].count;
};

// =====================================================
// DASHBOARD - JOB STATUS COUNTS
// =====================================================

const getJobStatusCounts = async () => {
  if (!(await tableExists("jobs"))) {
    return {
      approvedJobs: 0,
      openJobs: 0,
    };
  }

  const hasStatus = await columnExists(
    "jobs",
    "status"
  );

  if (!hasStatus) {
    return {
      approvedJobs: 0,
      openJobs: await getTotalJobs(),
    };
  }

  const approvedResult = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM jobs
    WHERE LOWER(TRIM(status)) = 'approved'
    `
  );

  const openResult = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM jobs
    WHERE LOWER(TRIM(status)) = 'open'
    `
  );

  return {
    approvedJobs:
      approvedResult.rows[0].count,
    openJobs:
      openResult.rows[0].count,
  };
};

// =====================================================
// DASHBOARD - RECENT JOBS
// =====================================================

const getRecentJobs = async () => {
  if (!(await tableExists("jobs"))) {
    return [];
  }

  const hasCreatedAt = await columnExists(
    "jobs",
    "created_at"
  );

  const result = await pool.query(
    hasCreatedAt
      ? `
        SELECT *
        FROM jobs
        ORDER BY created_at DESC
        LIMIT 5
        `
      : `
        SELECT *
        FROM jobs
        ORDER BY id DESC
        LIMIT 5
        `
  );

  return result.rows;
};

// =====================================================
// GET MANAGER INTERVIEWS
// =====================================================
// IMPORTANT:
// Returns:
//
// interview_date
// interview_time
// interview_type
// interviewer
// status
// notes
// meeting_link
// location
// applicant details
// job details
// =====================================================

const getManagerInterviews = async () => {
  const interviewsExists = await tableExists(
    "interviews"
  );

  const applicationsExists = await tableExists(
    "applications"
  );

  const jobsExists = await tableExists("jobs");

  if (
    !interviewsExists ||
    !applicationsExists ||
    !jobsExists
  ) {
    return [];
  }

  // ---------------------------------------------------
  // APPLICATION COLUMNS
  // ---------------------------------------------------

  const applicationPhone = await columnExists(
    "applications",
    "phone"
  );

  const applicationApplicantName =
    await columnExists(
      "applications",
      "applicant_name"
    );

  const applicationEmail = await columnExists(
    "applications",
    "email"
  );

  const applicationStatus = await columnExists(
    "applications",
    "status"
  );

  // ---------------------------------------------------
  // JOB COLUMNS
  // ---------------------------------------------------

  const jobTitle = await columnExists(
    "jobs",
    "title"
  );

  const jobCompanyName = await columnExists(
    "jobs",
    "company_name"
  );

  const jobCompany = await columnExists(
    "jobs",
    "company"
  );

  const jobLocation = await columnExists(
    "jobs",
    "location"
  );

  // ---------------------------------------------------
  // INTERVIEW COLUMNS
  // ---------------------------------------------------

  const hasMeetingLink = await columnExists(
    "interviews",
    "meeting_link"
  );

  const hasInterviewLocation = await columnExists(
    "interviews",
    "location"
  );

  // ---------------------------------------------------
  // APPLICATION EXPRESSIONS
  // ---------------------------------------------------

  const applicantNameExpression =
    applicationApplicantName
      ? "a.applicant_name"
      : "NULL::text";

  const emailExpression =
    applicationEmail
      ? "a.email"
      : "NULL::text";

  const phoneExpression =
    applicationPhone
      ? "a.phone"
      : "NULL::text";

  const applicationStatusExpression =
    applicationStatus
      ? "a.status"
      : "NULL::text";

  // ---------------------------------------------------
  // JOB EXPRESSIONS
  // ---------------------------------------------------

  const titleExpression = jobTitle
    ? "j.title"
    : "NULL::text";

  let companyExpression = "NULL::text";

  if (jobCompanyName) {
    companyExpression = "j.company_name";
  } else if (jobCompany) {
    companyExpression = "j.company";
  }

  const jobLocationExpression = jobLocation
    ? "j.location"
    : "NULL::text";

  // ---------------------------------------------------
  // INTERVIEW EXPRESSIONS
  // ---------------------------------------------------

  const meetingLinkExpression = hasMeetingLink
    ? "i.meeting_link"
    : "NULL::text";

  const interviewLocationExpression =
    hasInterviewLocation
      ? "i.location"
      : "NULL::text";

  // ---------------------------------------------------
  // QUERY
  // ---------------------------------------------------

  const result = await pool.query(
    `
    SELECT

      i.id,

      i.application_id,

      i.interview_date,

      i.interview_time,

      i.interview_type,

      i.interviewer,

      i.status AS interview_status,

      i.notes,

      ${meetingLinkExpression}
        AS meeting_link,

      ${interviewLocationExpression}
        AS interview_location,

      ${applicantNameExpression}
        AS applicant_name,

      ${emailExpression}
        AS email,

      ${phoneExpression}
        AS phone,

      ${applicationStatusExpression}
        AS application_status,

      j.id AS job_id,

      ${titleExpression}
        AS job_title,

      ${companyExpression}
        AS company_name,

      ${jobLocationExpression}
        AS job_location

    FROM interviews i

    INNER JOIN applications a
      ON a.id = i.application_id

    INNER JOIN jobs j
      ON j.id = a.job_id

    ORDER BY
      i.interview_date DESC,
      i.interview_time DESC
    `
  );

  return result.rows;
};

// =====================================================
// COMPLETE INTERVIEW
// =====================================================

const completeInterview = async (
  interviewId
) => {
  const result = await pool.query(
    `
    UPDATE interviews
    SET status = 'completed'
    WHERE id = $1
    RETURNING *
    `,
    [interviewId]
  );

  return result.rows[0] || null;
};

// =====================================================
// SELECT CANDIDATE
// =====================================================

const selectCandidate = async (
  applicationId
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const applicationsExists =
      await tableExists("applications");

    const jobsExists =
      await tableExists("jobs");

    const interviewsExists =
      await tableExists("interviews");

    if (
      !applicationsExists ||
      !jobsExists ||
      !interviewsExists
    ) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "TABLE_MISSING",
        message:
          "Required application tables are not available",
      };
    }

    const hasApplicantName =
      await columnExists(
        "applications",
        "applicant_name"
      );

    const hasEmail =
      await columnExists(
        "applications",
        "email"
      );

    const hasStatus =
      await columnExists(
        "applications",
        "status"
      );

    const hasTitle =
      await columnExists(
        "jobs",
        "title"
      );

    const hasCompanyName =
      await columnExists(
        "jobs",
        "company_name"
      );

    const hasCompany =
      await columnExists(
        "jobs",
        "company"
      );

    if (!hasEmail || !hasStatus) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "APPLICATION_COLUMNS_MISSING",
        message:
          "Required application columns are missing",
      };
    }

    const applicantNameExpression =
      hasApplicantName
        ? "a.applicant_name"
        : "NULL::text";

    const titleExpression = hasTitle
      ? "j.title"
      : "NULL::text";

    let companyExpression =
      "NULL::text";

    if (hasCompanyName) {
      companyExpression =
        "j.company_name";
    } else if (hasCompany) {
      companyExpression =
        "j.company";
    }

    // -------------------------------------------------
    // GET APPLICATION + LATEST INTERVIEW
    // -------------------------------------------------

    const applicationResult =
      await client.query(
        `
        SELECT

          a.id AS application_id,

          ${applicantNameExpression}
            AS applicant_name,

          a.email,

          a.status
            AS application_status,

          j.id AS job_id,

          ${titleExpression}
            AS job_title,

          ${companyExpression}
            AS company_name,

          i.id AS interview_id,

          i.status
            AS interview_status

        FROM applications a

        INNER JOIN jobs j
          ON j.id = a.job_id

        LEFT JOIN LATERAL (
          SELECT *
          FROM interviews
          WHERE application_id = a.id
          ORDER BY id DESC
          LIMIT 1
        ) i
          ON true

        WHERE a.id = $1
        `,
        [applicationId]
      );

    if (
      applicationResult.rows.length === 0
    ) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "NOT_FOUND",
        message:
          "Application not found",
      };
    }

    const application =
      applicationResult.rows[0];

    // -------------------------------------------------
    // CHECK INTERVIEW
    // -------------------------------------------------

    if (!application.interview_id) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "NO_INTERVIEW",
        message:
          "No interview found for this candidate",
      };
    }

    // -------------------------------------------------
    // CHECK COMPLETED
    // -------------------------------------------------

    if (
      String(
        application.interview_status
      ).toLowerCase() !== "completed"
    ) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "INTERVIEW_NOT_COMPLETED",
        message:
          "Candidate can be selected only after the interview is completed",
      };
    }

    // -------------------------------------------------
    // CHECK ALREADY SELECTED
    // -------------------------------------------------

    if (
      String(
        application.application_status
      ).toLowerCase() === "selected"
    ) {
      await client.query("ROLLBACK");

      return {
        success: false,
        code: "ALREADY_SELECTED",
        message:
          "Candidate is already selected",
      };
    }

    // -------------------------------------------------
    // SELECT APPLICATION
    // -------------------------------------------------

    const updateResult =
      await client.query(
        `
        UPDATE applications
        SET status = 'selected'
        WHERE id = $1
        RETURNING *
        `,
        [applicationId]
      );

    // -------------------------------------------------
    // CREATE NOTIFICATION
    // -------------------------------------------------

    const notificationsExists =
      await tableExists(
        "notifications"
      );

    if (notificationsExists) {
      const hasNotificationEmail =
        await columnExists(
          "notifications",
          "email"
        );

      const hasNotificationType =
        await columnExists(
          "notifications",
          "type"
        );

      const hasNotificationTitle =
        await columnExists(
          "notifications",
          "title"
        );

      const hasNotificationMessage =
        await columnExists(
          "notifications",
          "message"
        );

      if (
        hasNotificationEmail &&
        hasNotificationType &&
        hasNotificationTitle &&
        hasNotificationMessage
      ) {
        const applicantName =
          application.applicant_name ||
          "Candidate";

        const jobTitle =
          application.job_title ||
          "the position";

        const companyName =
          application.company_name ||
          "the company";

        await client.query(
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
            "application_selected",
            "🎉 Application Selected",
            `Congratulations ${applicantName}! You have been selected for the ${jobTitle} position at ${companyName}.`,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return {
      success: true,

      message:
        "Candidate selected successfully",

      application:
        updateResult.rows[0],

      notification: {
        title:
          "🎉 Application Selected",

        message:
          `Congratulations! You have been selected for the ${
            application.job_title ||
            "the position"
          }.`,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  columnExists,
  tableExists,

  createManager,
  findManagerByEmail,
  getAllManagers,
  getManagerById,
  updateManager,
  changePassword,
  deleteManager,

  getTotalJobs,
  getApplicationCount,
  getRecentApplicants,
  getInterviewCount,
  getRecruiterCount,
  getJobStatusCounts,
  getRecentJobs,

  getManagerInterviews,
  completeInterview,
  selectCandidate,
};