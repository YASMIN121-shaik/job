const pool = require("../../db");
const notificationModel = require("../models/notificationModel");

// =====================================================
// APPLY FOR JOB
// POST /api/jobs/applications
// =====================================================

const applyForJob = async (req, res) => {
  try {
    const {
      job_id,
      applicant_name,
      email,
      phone,
      experience,
      resume,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!job_id || !email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job ID and email are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // -------------------------------------------------
    // CHECK JOB EXISTS
    // -------------------------------------------------

    const jobResult = await pool.query(
      `
      SELECT
        id,
        title,
        company,
        location
      FROM jobs
      WHERE id = $1
      LIMIT 1
      `,
      [job_id]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const job = jobResult.rows[0];

    // -------------------------------------------------
    // CHECK DUPLICATE APPLICATION
    // -------------------------------------------------

    const existing = await pool.query(
      `
      SELECT id
      FROM applications
      WHERE job_id = $1
      AND LOWER(TRIM(email)) = LOWER(TRIM($2))
      LIMIT 1
      `,
      [job_id, cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // -------------------------------------------------
    // INSERT APPLICATION
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
        status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'Pending'
      )
      RETURNING *
      `,
      [
        job_id,
        applicant_name || "",
        cleanEmail,
        phone || "",
        experience || "",
        resume || "",
      ]
    );

    const application = result.rows[0];

    // =================================================
    // CREATE APPLICATION NOTIFICATION
    // =================================================

    try {
      if (
        notificationModel &&
        typeof notificationModel.createNotification === "function"
      ) {
        await notificationModel.createNotification({
          email: cleanEmail,
          type: "application",
          title: "Application Submitted",
          message: `Your application for ${
            job.title || "the job"
          } at ${
            job.company || "the company"
          } has been submitted successfully.`,
        });

        console.log(
          `NOTIFICATION CREATED FOR: ${cleanEmail}`
        );
      } else {
        console.error(
          "notificationModel.createNotification is not available"
        );
      }
    } catch (notificationError) {
      // Notification failure should NOT cancel the application.
      console.error(
        "APPLICATION NOTIFICATION ERROR:",
        notificationError
      );
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });

  } catch (error) {
    console.error("APPLY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to apply for job",
      error: error.message,
    });
  }
};


// =====================================================
// GET APPLICATIONS
//
// GET /api/jobs/applications
// GET /api/jobs/applications?email=test@gmail.com
// =====================================================

const getApplications = async (req, res) => {
  try {
    const { email } = req.query;

    let query = `
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
        j.company,
        j.location,
        i.id AS interview_id,
    i.interview_date,
    i.interview_time,
    i.interview_type,
    i.interviewer,
    i.status AS interview_status,
    i.notes AS interview_notes

      FROM applications a

      LEFT JOIN jobs j
        ON a.job_id = j.id
      LEFT JOIN interviews i
    ON i.application_id = a.id
    `;

    const params = [];

    // -------------------------------------------------
    // FILTER BY EMAIL
    // -------------------------------------------------

    if (email && email.trim()) {
      query += `
        WHERE LOWER(TRIM(a.email)) =
              LOWER(TRIM($1))
      `;

      params.push(email.trim());
    }

    // -------------------------------------------------
    // ORDER
    // -------------------------------------------------

    query += `
      ORDER BY a.id DESC
    `;

    const result = await pool.query(
      query,
      params
    );

    // -------------------------------------------------
    // FORMAT RESPONSE
    // -------------------------------------------------

    const applications = result.rows.map(
      (application) => ({
        id: application.id,

        job_id: application.job_id,

        name:
          application.applicant_name ||
          "N/A",

        applicant_name:
          application.applicant_name ||
          "N/A",

        email:
          application.email ||
          "N/A",

        phone:
          application.phone ||
          "",

        experience:
          application.experience ||
          "",

        resume:
          application.resume ||
          "",

        status:
          application.status ||
          "Pending",

        applied_at:
          application.applied_at ||
          null,

        position:
          application.job_title ||
          "Job",

        job_title:
          application.job_title ||
          "Job",

        company:
          application.company ||
          "N/A",

        location:
          application.location ||
          "",
        interview_id:
  application.interview_id || null,

interview_date:
  application.interview_date || null,

interview_time:
  application.interview_time || null,

interview_type:
  application.interview_type || null,

interviewer:
  application.interviewer || null,

interview_status:
  application.interview_status || null,

interview_notes:
  application.interview_notes || null,
      })
    );

    return res.json({
      success: true,
      applications,
      total: applications.length,
    });

  } catch (error) {
    console.error(
      "GET APPLICATIONS ERROR:",
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
// UPDATE APPLICATION STATUS
// PUT /api/jobs/applications/:id/status
// =====================================================

const updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // -------------------------------------------------
    // ALLOWED STATUS
    // -------------------------------------------------

    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Rejected",
      "Interview",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    // -------------------------------------------------
    // UPDATE APPLICATION
    // -------------------------------------------------

    const result = await pool.query(
      `
      UPDATE applications
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [
        status,
        Number(id),
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application = result.rows[0];

    // -------------------------------------------------
    // GET JOB INFORMATION
    // -------------------------------------------------

    const jobResult = await pool.query(
      `
      SELECT
        title,
        company
      FROM jobs
      WHERE id = $1
      LIMIT 1
      `,
      [application.job_id]
    );

    const job = jobResult.rows[0] || {};

    // =================================================
    // BUILD NOTIFICATION
    // =================================================

    let notificationTitle = "";
    let notificationMessage = "";

    if (status === "Accepted") {
      notificationTitle =
        "Application Accepted";

      notificationMessage =
        `Congratulations! Your application for ${
          job.title || "the job"
        } at ${
          job.company || "the company"
        } has been accepted.`;

    } else if (status === "Rejected") {
      notificationTitle =
        "Application Rejected";

      notificationMessage =
        `Your application for ${
          job.title || "the job"
        } at ${
          job.company || "the company"
        } has been rejected.`;

    } else if (status === "Interview") {
      notificationTitle =
        "Interview Scheduled";

      notificationMessage =
        `Your application for ${
          job.title || "the job"
        } at ${
          job.company || "the company"
        } has moved to the interview stage.`;

    } else {
      notificationTitle =
        "Application Updated";

      notificationMessage =
        `Your application for ${
          job.title || "the job"
        } at ${
          job.company || "the company"
        } is now marked as ${status}.`;
    }

    // =================================================
    // CREATE STATUS NOTIFICATION
    // =================================================

    try {
      if (
        application.email &&
        notificationModel &&
        typeof notificationModel.createNotification ===
          "function"
      ) {
        await notificationModel.createNotification({
          email: application.email,
          type: "application",
          title: notificationTitle,
          message: notificationMessage,
        });

        console.log(
          `STATUS NOTIFICATION CREATED FOR: ${application.email}`
        );
      } else {
        console.error(
          "notificationModel.createNotification is not available"
        );
      }
    } catch (notificationError) {
      console.error(
        "STATUS NOTIFICATION ERROR:",
        notificationError
      );
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      message:
        "Application status updated successfully",
      application,
    });

  } catch (error) {
    console.error(
      "UPDATE APPLICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update application status",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE APPLICATION
// DELETE /api/jobs/applications/:id
// =====================================================

const deleteApplication = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE ID
    // -------------------------------------------------

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // -------------------------------------------------
    // DELETE
    // -------------------------------------------------

    const result = await pool.query(
      `
      DELETE FROM applications
      WHERE id = $1
      RETURNING id
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Application deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE APPLICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete application",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  applyForJob,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
};