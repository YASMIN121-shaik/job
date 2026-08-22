const pool = require("../../db");
const interviewModel = require("../models/interviewModel");

// =====================================================
// GET ALL INTERVIEWS - MANAGER
// GET /api/manager/interviews
// =====================================================

const getInterviews = async (req, res) => {
  try {
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

    return res.json({
      success: true,
      interviews: result.rows,
    });
  } catch (error) {
    console.error("GET INTERVIEWS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB SEEKER INTERVIEWS
// GET /api/jobseeker/interviews?email=xxx
// =====================================================

const getJobSeekerInterviews = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

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

    return res.json({
      success: true,
      interviews: result.rows,
    });
  } catch (error) {
    console.error(
      "JOB SEEKER INTERVIEWS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job seeker interviews",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE INTERVIEW
// POST /api/manager/interviews
// =====================================================

const createInterview = async (req, res) => {
  try {
    const {
      application_id,
      interview_date,
      interview_time,
      interview_type,
      interviewer,
      notes,
    } = req.body;

    if (
      !application_id ||
      !interview_date ||
      !interview_time
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Application, date and time are required",
      });
    }

    // ---------------------------------------------
    // VERIFY APPLICATION EXISTS
    // ---------------------------------------------

    const applicationResult = await pool.query(
      `
      SELECT id
      FROM applications
      WHERE id = $1
      `,
      [application_id]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // ---------------------------------------------
    // CREATE INTERVIEW
    // ---------------------------------------------

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

    // ---------------------------------------------
    // UPDATE APPLICATION STATUS
    // ---------------------------------------------

    await pool.query(
      `
      UPDATE applications
      SET status = 'Interview'
      WHERE id = $1
      `,
      [application_id]
    );

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interview: result.rows[0],
    });
  } catch (error) {
    console.error(
      "CREATE INTERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE INTERVIEW
// PUT /api/manager/interviews/:id
// =====================================================

const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      interview_date,
      interview_time,
      interview_type,
      interviewer,
      status,
      notes,
    } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.json({
      success: true,
      message: "Interview updated successfully",
      interview: result.rows[0],
    });
  } catch (error) {
    console.error(
      "UPDATE INTERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update interview",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE INTERVIEW
// DELETE /api/manager/interviews/:id
// =====================================================

const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM interviews
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.json({
      success: true,
      message: "Interview cancelled successfully",
    });
  } catch (error) {
    console.error(
      "DELETE INTERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to cancel interview",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getInterviews,
  getJobSeekerInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
};