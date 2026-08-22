const pool = require("../../db");
const jobModel = require("../models/jobModel");

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
// GET ALL JOBS
// =====================================================

const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobModel.getAllJobs();

    return res.json({
      success: true,
      jobs,
      total: jobs.length,
    });
  } catch (error) {
    console.error("GET JOBS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

// =====================================================
// GET JOB BY ID
// =====================================================

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !/^\d+$/.test(String(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await jobModel.getJobById(Number(id));

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("GET JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE JOB
// =====================================================

const createJob = async (req, res) => {
  try {
    console.log("====================================");
    console.log("CREATE JOB REQUEST");
    console.log("USER:", req.user);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("====================================");

    const {
      title,
      company,
      location,
      salary,
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
    } = req.body;

    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (
      !title ||
      !String(title).trim() ||
      !company ||
      !String(company).trim() ||
      !location ||
      !String(location).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, company and location are required",
      });
    }

    // =================================================
    // VACANCIES
    // =================================================

    let vacancyCount = 1;

    if (
      vacancies !== undefined &&
      vacancies !== null &&
      vacancies !== ""
    ) {
      vacancyCount = Number(vacancies);

      if (
        !Number.isInteger(vacancyCount) ||
        vacancyCount < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Vacancies must be a valid positive number",
        });
      }
    }

    // =================================================
    // PDF DESCRIPTION FILE
    // =================================================

    const descriptionFile = req.file
      ? `/uploads/job-descriptions/${req.file.filename}`
      : null;

    // =================================================
    // CREATE JOB
    // =================================================

    const job = await jobModel.createJob({
      title: String(title).trim(),
      company: String(company).trim(),
      location: String(location).trim(),

      salary: salary || null,
      experience: experience || null,
      job_type: job_type || null,
      category: category || null,
      department: department || null,
      education: education || null,

      vacancies: vacancyCount,

      skills: skills || null,
      description: description || null,
      responsibilities: responsibilities || null,
      benefits: benefits || null,

      last_date: last_date || null,

      status: status || "Open",

      description_file: descriptionFile,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.error("CREATE JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE JOB
// =====================================================

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !/^\d+$/.test(String(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const {
      title,
      company,
      location,
      salary,
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
    } = req.body;

    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (
      !title ||
      !String(title).trim() ||
      !company ||
      !String(company).trim() ||
      !location ||
      !String(location).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, company and location are required",
      });
    }

    // =================================================
    // VACANCIES
    // =================================================

    let vacancyCount = 1;

    if (
      vacancies !== undefined &&
      vacancies !== null &&
      vacancies !== ""
    ) {
      vacancyCount = Number(vacancies);

      if (
        !Number.isInteger(vacancyCount) ||
        vacancyCount < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Vacancies must be a valid positive number",
        });
      }
    }

    // =================================================
    // UPDATE JOB
    // =================================================

    const job = await jobModel.updateJob(
      Number(id),
      {
        title: String(title).trim(),
        company: String(company).trim(),
        location: String(location).trim(),

        salary: salary || null,
        experience: experience || null,
        job_type: job_type || null,
        category: category || null,
        department: department || null,
        education: education || null,

        vacancies: vacancyCount,

        skills: skills || null,
        description: description || null,
        responsibilities: responsibilities || null,
        benefits: benefits || null,

        last_date: last_date || null,

        status: status || "Open",
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // =================================================
    // OPTIONAL NEW PDF
    // =================================================

    if (req.file) {
      const descriptionFile =
        `/uploads/job-descriptions/${req.file.filename}`;

      try {
        const hasDescriptionFile =
          await columnExists(
            "jobs",
            "description_file"
          );

        if (hasDescriptionFile) {
          const updatedResult =
            await pool.query(
              `
              UPDATE jobs
              SET description_file = $1
              WHERE id = $2
              RETURNING *
              `,
              [
                descriptionFile,
                Number(id),
              ]
            );

          return res.json({
            success: true,
            message: "Job updated successfully",
            job: updatedResult.rows[0],
          });
        }
      } catch (fileError) {
        console.error(
          "UPDATE JOB FILE ERROR:",
          fileError
        );
      }
    }

    return res.json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE JOB
// =====================================================

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !/^\d+$/.test(String(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const deletedJob =
      await jobModel.deleteJob(Number(id));

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.json({
      success: true,
      message: "Job deleted successfully",
      deletedJobId: deletedJob.id,
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

// =====================================================
// SCHEDULE INTERVIEW
// POST /api/jobs/interviews
// =====================================================

const scheduleInterview = async (req, res) => {
  try {
    console.log("====================================");
    console.log("SCHEDULE INTERVIEW REQUEST");
    console.log("USER:", req.user);
    console.log("BODY:", req.body);
    console.log("====================================");

    const {
      application_id,
      interview_date,
      interview_time,
      interview_type,
      meeting_link,
      interviewer,
      status,
      notes,
    } = req.body;

    // =================================================
    // VALIDATE APPLICATION ID
    // =================================================

    if (
      !application_id ||
      !/^\d+$/.test(String(application_id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid Application ID is required",
      });
    }

    const applicationId = Number(application_id);

    // =================================================
    // VALIDATE DATE
    // =================================================

    if (!interview_date) {
      return res.status(400).json({
        success: false,
        message: "Interview date is required",
      });
    }

    // =================================================
    // VALIDATE TIME
    // =================================================

    if (!interview_time) {
      return res.status(400).json({
        success: false,
        message: "Interview time is required",
      });
    }

    // =================================================
    // INTERVIEW TYPE
    // =================================================

    const interviewType =
      interview_type || "Online";

    if (
      !["Online", "Offline"].includes(
        interviewType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interview type must be Online or Offline",
      });
    }

    // =================================================
    // MEETING LINK
    // =================================================

    let cleanMeetingLink = null;

    if (interviewType === "Online") {
      if (
        !meeting_link ||
        !String(meeting_link).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Meeting link is required for online interviews",
        });
      }

      cleanMeetingLink =
        String(meeting_link).trim();

      // Validate URL
      try {
        new URL(cleanMeetingLink);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid meeting URL",
        });
      }
    }

    // =================================================
    // CHECK APPLICATION
    // =================================================

    const applicationResult =
      await pool.query(
        `
        SELECT
          a.id,
          a.applicant_name,
          a.email,
          a.phone,
          a.status,
          a.job_id,

          j.title AS job_title,
          j.company,
          j.location

        FROM applications a

        LEFT JOIN jobs j
          ON a.job_id = j.id

        WHERE a.id = $1
        `,
        [applicationId]
      );

    if (
      applicationResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application =
      applicationResult.rows[0];

    // =================================================
    // CHECK EXISTING INTERVIEW
    // =================================================

    const existingInterview =
      await pool.query(
        `
        SELECT
          id,
          status
        FROM interviews
        WHERE application_id = $1
        ORDER BY id DESC
        LIMIT 1
        `,
        [applicationId]
      );

    if (
      existingInterview.rows.length > 0
    ) {
      const existingStatus =
        String(
          existingInterview.rows[0].status || ""
        ).toLowerCase();

      if (
        existingStatus === "scheduled" ||
        existingStatus === "pending"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An interview is already scheduled for this candidate",
          interview_id:
            existingInterview.rows[0].id,
        });
      }
    }

    // =================================================
    // CHECK INTERVIEW TABLE COLUMNS
    // =================================================

    const hasMeetingLink =
      await columnExists(
        "interviews",
        "meeting_link"
      );

    const hasLocation =
      await columnExists(
        "interviews",
        "location"
      );

    // =================================================
    // IMPORTANT
    // =================================================
    // Your current database has:
    //
    // id
    // application_id
    // interview_date
    // interview_time
    // interview_type
    // interviewer
    // status
    // notes
    // created_at
    // meeting_link
    // location
    //
    // Therefore meeting_link and location are
    // included dynamically below.

    // =================================================
    // BUILD INSERT
    // =================================================

    const columns = [
      "application_id",
      "interview_date",
      "interview_time",
      "interview_type",
      "interviewer",
      "status",
      "notes",
    ];

    const values = [
      applicationId,
      interview_date,
      interview_time,
      interviewType,
      interviewer
        ? String(interviewer).trim()
        : null,
      status || "Scheduled",
      notes
        ? String(notes).trim()
        : null,
    ];

    const placeholders = [
      "$1",
      "$2",
      "$3",
      "$4",
      "$5",
      "$6",
      "$7",
    ];

    let parameterIndex = 8;

    // =================================================
    // SAVE MEETING LINK
    // =================================================

    if (hasMeetingLink) {
      columns.push("meeting_link");

      values.push(
        interviewType === "Online"
          ? cleanMeetingLink
          : null
      );

      placeholders.push(
        `$${parameterIndex++}`
      );
    }

    // =================================================
    // SAVE LOCATION
    // =================================================

    if (hasLocation) {
      columns.push("location");

      values.push(
        interviewType === "Offline"
          ? application.location || null
          : null
      );

      placeholders.push(
        `$${parameterIndex++}`
      );
    }

    console.log(
      "INTERVIEW INSERT COLUMNS:",
      columns
    );

    console.log(
      "INTERVIEW INSERT VALUES:",
      values
    );

    // =================================================
    // INSERT INTERVIEW
    // =================================================

    const interviewResult =
      await pool.query(
        `
        INSERT INTO interviews
        (
          ${columns.join(", ")}
        )
        VALUES
        (
          ${placeholders.join(", ")}
        )
        RETURNING *
        `,
        values
      );

    const interview =
      interviewResult.rows[0];

    // =================================================
    // UPDATE APPLICATION STATUS
    // =================================================

    await pool.query(
      `
      UPDATE applications
      SET status = 'interview'
      WHERE id = $1
      `,
      [applicationId]
    );

    // =================================================
    // CREATE NOTIFICATION
    // =================================================

    try {
      const notificationsTable =
        await pool.query(
          `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'notifications'
          ) AS exists
          `
        );

      if (
        notificationsTable.rows[0].exists &&
        application.email
      ) {
        const hasEmail =
          await columnExists(
            "notifications",
            "email"
          );

        const hasType =
          await columnExists(
            "notifications",
            "type"
          );

        const hasTitle =
          await columnExists(
            "notifications",
            "title"
          );

        const hasMessage =
          await columnExists(
            "notifications",
            "message"
          );

        if (
          hasEmail &&
          hasType &&
          hasTitle &&
          hasMessage
        ) {
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

              "interview_scheduled",

              "Interview Scheduled",

              `Your interview for ${
                application.job_title ||
                "the position"
              } at ${
                application.company ||
                "the company"
              } has been scheduled for ${
                interview_date
              } at ${
                interview_time
              }.`,
            ]
          );
        }
      }
    } catch (notificationError) {
      // Do not fail the interview if notification fails
      console.error(
        "NOTIFICATION ERROR:",
        notificationError
      );
    }

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Interview scheduled successfully",

      interview: {
        ...interview,

        candidate_name:
          application.applicant_name,

        email:
          application.email,

        phone:
          application.phone,

        job_id:
          application.job_id,

        job_title:
          application.job_title,

        company:
          application.company,

        job_location:
          application.location,

        // Explicitly return the meeting link
        meeting_link:
          interview.meeting_link || null,

        // Explicitly return offline location
        location:
          interview.location ||
          application.location ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "SCHEDULE INTERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to schedule interview",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL INTERVIEWS
// GET /api/jobs/interviews
// =====================================================

const getInterviews = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.application_id,
        i.job_id,
        i.interview_date,
        i.interview_time,
        i.meeting_link,
        i.status,
        i.created_at,

        a.applicant_name,
        a.email,
        a.phone,

        j.title AS job_title,
        j.company,
        j.location

      FROM interviews i

      LEFT JOIN applications a
        ON a.id = i.application_id

      LEFT JOIN jobs j
        ON j.id = i.job_id

      ORDER BY i.id DESC
    `);

    return res.status(200).json({
      success: true,
      interviews: result.rows,
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
// EXPORT
// =====================================================

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  scheduleInterview,
  getInterviews,
};