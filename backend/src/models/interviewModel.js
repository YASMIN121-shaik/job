const pool = require("../../db");

// =====================================================
// GET ALL INTERVIEWS - MANAGER
// =====================================================

const getAllInterviews = async () => {
  const result = await pool.query(`
    SELECT
      i.*,

      a.applicant_name AS candidate_name,
      a.email,
      a.phone,
      a.status AS application_status,

      j.id AS job_id,
      j.title AS job_title,
      j.company,
      j.location

    FROM interviews i

    LEFT JOIN applications a
      ON i.application_id = a.id

    LEFT JOIN jobs j
      ON a.job_id = j.id

    ORDER BY
      i.interview_date ASC,
      i.interview_time ASC,
      i.id DESC
  `);

  return result.rows;
};


// =====================================================
// GET JOB SEEKER INTERVIEWS
// =====================================================

const getInterviewsByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT
      i.*,

      a.applicant_name,
      a.email,
      a.phone,
      a.status AS application_status,

      j.id AS job_id,
      j.title AS job_title,
      j.company,
      j.location

    FROM interviews i

    INNER JOIN applications a
      ON i.application_id = a.id

    LEFT JOIN jobs j
      ON a.job_id = j.id

    WHERE LOWER(a.email) = LOWER($1)

    ORDER BY
      i.interview_date ASC,
      i.interview_time ASC
    `,
    [email]
  );

  return result.rows;
};


// =====================================================
// CHECK APPLICATION EXISTS
// =====================================================

const applicationExists = async (applicationId) => {
  const result = await pool.query(
    `
    SELECT id
    FROM applications
    WHERE id = $1
    `,
    [applicationId]
  );

  return result.rows.length > 0;
};


// =====================================================
// CREATE INTERVIEW
// =====================================================

const createInterview = async ({
  application_id,
  interview_date,
  interview_time,
  interview_type,
  interviewer,
  notes,
}) => {
  const result = await pool.query(
    `
    INSERT INTO interviews
    (
      application_id,
      interview_date,
      interview_time,
      interview_type,
      interviewer,
      status,
      notes
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      'Scheduled',
      $6
    )
    RETURNING *
    `,
    [
      application_id,
      interview_date,
      interview_time,
      interview_type || "Online",
      interviewer || null,
      notes || null,
    ]
  );

  return result.rows[0];
};


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

const updateApplicationStatus = async (
  applicationId
) => {
  await pool.query(
    `
    UPDATE applications
    SET status = 'Interview'
    WHERE id = $1
    `,
    [applicationId]
  );
};


// =====================================================
// GET INTERVIEW BY ID
// =====================================================

const getInterviewById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM interviews
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};


// =====================================================
// UPDATE INTERVIEW
// =====================================================

const updateInterview = async (
  id,
  {
    interview_date,
    interview_time,
    interview_type,
    interviewer,
    status,
    notes,
  }
) => {
  const result = await pool.query(
    `
    UPDATE interviews
    SET
      interview_date = $1,
      interview_time = $2,
      interview_type = $3,
      interviewer = $4,
      status = $5,
      notes = $6

    WHERE id = $7

    RETURNING *
    `,
    [
      interview_date,
      interview_time,
      interview_type || "Online",
      interviewer || null,
      status || "Scheduled",
      notes || null,
      id,
    ]
  );

  return result.rows[0] || null;
};


// =====================================================
// DELETE INTERVIEW
// =====================================================

const deleteInterview = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM interviews
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rows[0] || null;
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAllInterviews,
  getInterviewsByEmail,
  applicationExists,
  createInterview,
  updateApplicationStatus,
  getInterviewById,
  updateInterview,
  deleteInterview,
};