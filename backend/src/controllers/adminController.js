// =====================================================
// CONNECT MODEL
// =====================================================

const pool = require("../../db");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");


// =====================================================
// ADMIN CONTROLLER
// =====================================================
//
// Supported roles:
//
// admin       -> Administrator
// job_seeker  -> Job Seeker
// manager     -> Manager
// job_holder  -> Job Holder / Employer
//
// =====================================================


// =====================================================
// ALLOWED ROLES
// =====================================================

const ALLOWED_ROLES = [
  "admin",
  "job_seeker",
  "manager",
  "job_holder",
];


// =====================================================
// TEST
// =====================================================

const adminTest = async (req, res) => {
  res.json({
    success: true,
    message: "Admin routes are working",
  });
};


// =====================================================
// GET ADMIN DASHBOARD / REPORT STATISTICS
// =====================================================
//
// GET /api/admin/stats
//
// =====================================================

const getDashboardStats = async (req, res) => {
  try {

    const usersResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total_users,

        COUNT(*) FILTER (
          WHERE LOWER(TRIM(role)) = 'job_seeker'
        )::int AS job_seekers,

        COUNT(*) FILTER (
          WHERE LOWER(TRIM(role)) = 'job_holder'
        )::int AS job_holders,

        COUNT(*) FILTER (
          WHERE LOWER(TRIM(role)) = 'manager'
        )::int AS managers,

        COUNT(*) FILTER (
          WHERE LOWER(TRIM(role)) = 'admin'
        )::int AS admins

      FROM users
    `);


    const jobsResult = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM jobs
    `);


    const applicationsResult = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM applications
    `);


    const interviewsResult = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM interviews
    `);


    const userStats = usersResult.rows[0];


    const totalUsers =
      Number(userStats.total_users) || 0;


    const jobSeekers =
      Number(userStats.job_seekers) || 0;


    const jobHolders =
      Number(userStats.job_holders) || 0;


    const managers =
      Number(userStats.managers) || 0;


    const admins =
      Number(userStats.admins) || 0;


    const totalJobs =
      Number(jobsResult.rows[0].count) || 0;


    const totalApplications =
      Number(applicationsResult.rows[0].count) || 0;


    const totalInterviews =
      Number(interviewsResult.rows[0].count) || 0;


    res.json({
      success: true,

      totalUsers,

      totalJobs,

      totalApplications,

      totalInterviews,

      jobSeekers,

      jobHolders,

      managers,

      admins,

      totalJobSeekers:
        jobSeekers,

      totalJobHolders:
        jobHolders,

      totalManagers:
        managers,

      totalAdmins:
        admins,
    });

  } catch (error) {

    console.error(
      "ADMIN STATS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch admin statistics",
      error: error.message,
    });
  }
};


// =====================================================
// GET CHART STATISTICS
// =====================================================
//
// GET /api/admin/chart-stats
//
// =====================================================

const getChartStats = async (req, res) => {
  try {

    // -------------------------------------------------
    // USER ROLE DISTRIBUTION
    // -------------------------------------------------

    const usersResult = await pool.query(`
      SELECT
        LOWER(TRIM(role)) AS role,
        COUNT(*)::int AS count

      FROM users

      GROUP BY LOWER(TRIM(role))

      ORDER BY role
    `);


    // -------------------------------------------------
    // JOB STATUS
    // -------------------------------------------------

    let jobStatus = [];


    try {

      const jobsResult = await pool.query(`
        SELECT
          COALESCE(status, 'active') AS status,
          COUNT(*)::int AS count

        FROM jobs

        GROUP BY COALESCE(status, 'active')

        ORDER BY status
      `);

      jobStatus = jobsResult.rows;

    } catch (error) {

      console.log(
        "jobs.status not available. Using total jobs."
      );

      const totalJobsResult =
        await pool.query(`
          SELECT COUNT(*)::int AS count
          FROM jobs
        `);


      jobStatus = [
        {
          status: "Total Jobs",

          count:
            Number(
              totalJobsResult.rows[0].count
            ) || 0,
        },
      ];
    }


    // -------------------------------------------------
    // APPLICATION STATUS
    // -------------------------------------------------

    let applicationStatus = [];


    try {

      const applicationsResult =
        await pool.query(`
          SELECT
            COALESCE(status, 'pending') AS status,
            COUNT(*)::int AS count

          FROM applications

          GROUP BY COALESCE(status, 'pending')

          ORDER BY status
        `);


      applicationStatus =
        applicationsResult.rows;

    } catch (error) {

      console.log(
        "applications.status not available. Using total applications."
      );


      const totalApplicationsResult =
        await pool.query(`
          SELECT COUNT(*)::int AS count
          FROM applications
        `);


      applicationStatus = [
        {
          status:
            "Total Applications",

          count:
            Number(
              totalApplicationsResult.rows[0].count
            ) || 0,
        },
      ];
    }


    // -------------------------------------------------
    // INTERVIEWS
    // -------------------------------------------------

    const interviewsResult =
      await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM interviews
      `);


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({
      success: true,

      users:
        usersResult.rows,

      jobs:
        jobStatus,

      applications:
        applicationStatus,

      interviews: [
        {
          status:
            "Interviews",

          count:
            Number(
              interviewsResult.rows[0].count
            ) || 0,
        },
      ],
    });

  } catch (error) {

    console.error(
      "ADMIN CHART STATS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch chart statistics",
      error: error.message,
    });
  }
};


// =====================================================
// GET RECENT ACTIVITIES
// =====================================================

const getRecentActivities = async (
  req,
  res
) => {

  try {

    const result = await pool.query(`
      SELECT
        type,
        activity_id,
        title,
        description,
        activity_time

      FROM (

        SELECT
          'job' AS type,

          j.id::text AS activity_id,

          'New job posted' AS title,

          CONCAT(
            COALESCE(
              j.title,
              'A new job'
            ),

            CASE
              WHEN j.company IS NOT NULL
              AND TRIM(j.company) <> ''

              THEN CONCAT(
                ' at ',
                j.company
              )

              ELSE ''
            END
          ) AS description,

          j.created_at AS activity_time

        FROM jobs j

        WHERE j.created_at IS NOT NULL


        UNION ALL


        SELECT
          'application' AS type,

          a.id::text AS activity_id,

          'New job application' AS title,

          CONCAT(
            COALESCE(
              a.applicant_name,
              'A candidate'
            ),
            ' submitted an application'
          ) AS description,

          a.applied_at AS activity_time

        FROM applications a

        WHERE a.applied_at IS NOT NULL


        UNION ALL


        SELECT
          'interview' AS type,

          i.id::text AS activity_id,

          'Interview scheduled' AS title,

          CONCAT(
            'Interview with ',

            COALESCE(
              a.applicant_name,
              'candidate'
            ),

            CASE
              WHEN i.interview_date IS NOT NULL

              THEN CONCAT(
                ' on ',
                TO_CHAR(
                  i.interview_date,
                  'DD Mon YYYY'
                )
              )

              ELSE ''
            END

          ) AS description,

          i.created_at AS activity_time

        FROM interviews i

        LEFT JOIN applications a
          ON i.application_id = a.id

        WHERE i.created_at IS NOT NULL

      ) AS recent_activity

      ORDER BY activity_time DESC

      LIMIT 10
    `);


    const activities =
      result.rows.map(
        (activity) => ({
          id:
            activity.activity_id,

          type:
            activity.type,

          title:
            activity.title,

          description:
            activity.description,

          time:
            new Date(
              activity.activity_time
            ).toLocaleString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
        })
      );


    res.json({
      success: true,

      activities,

      total:
        activities.length,
    });

  } catch (error) {

    console.error(
      "ADMIN RECENT ACTIVITIES ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to fetch recent activities",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET ALL USERS
// =====================================================

const getUsers = async (
  req,
  res
) => {

  try {

    const result =
      await pool.query(`
        SELECT
          id,
          fullname,
          email,
          role,
          phone,
          location

        FROM users

        ORDER BY id DESC
      `);


    res.json({
      success: true,

      users:
        result.rows,

      total:
        result.rows.length,
    });

  } catch (error) {

    console.error(
      "ADMIN GET USERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to fetch users",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET USER BY ID
// =====================================================

const getUserById = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;


    if (!id) {

      return res.status(400).json({
        success: false,

        message:
          "User ID is required",
      });
    }


    const result =
      await pool.query(
        `
        SELECT
          id,
          fullname,
          email,
          role,
          phone,
          location

        FROM users

        WHERE id = $1
        `,
        [id]
      );


    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }


    res.json({
      success: true,

      user:
        result.rows[0],
    });

  } catch (error) {

    console.error(
      "ADMIN GET USER ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to fetch user",

      error:
        error.message,
    });
  }
};


// =====================================================
// UPDATE USER
// =====================================================

const updateUser = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;


    const {
      fullname,
      role,
      phone,
      location,
    } = req.body;


    // -------------------------------------------------
    // ID VALIDATION
    // -------------------------------------------------

    if (!id) {

      return res.status(400).json({
        success: false,

        message:
          "User ID is required",
      });
    }


    // -------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------

    if (
      !fullname ||
      !String(fullname).trim()
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Full name is required",
      });
    }


    // -------------------------------------------------
    // ROLE VALIDATION
    // -------------------------------------------------

    if (
      !role ||
      !String(role).trim()
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Role is required",
      });
    }


    const normalizedRole =
      String(role)
        .trim()
        .toLowerCase()
        .replaceAll(" ", "_");


    // -------------------------------------------------
    // ALLOWED ROLES
    // -------------------------------------------------

    if (
      !ALLOWED_ROLES.includes(
        normalizedRole
      )
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Invalid role. Allowed roles are admin, job_seeker, manager and job_holder",
      });
    }


    // -------------------------------------------------
    // UPDATE USER
    // -------------------------------------------------

    const result =
      await pool.query(
        `
        UPDATE users

        SET
          fullname = $1,
          role = $2,
          phone = $3,
          location = $4

        WHERE id = $5

        RETURNING
          id,
          fullname,
          email,
          role,
          phone,
          location
        `,
        [
          String(fullname).trim(),

          normalizedRole,

          phone
            ? String(phone).trim()
            : "",

          location
            ? String(location).trim()
            : "",

          id,
        ]
      );


    // -------------------------------------------------
    // USER NOT FOUND
    // -------------------------------------------------

    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }


    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    res.json({
      success: true,

      message:
        "User updated successfully",

      user:
        result.rows[0],
    });

  } catch (error) {

    console.error(
      "ADMIN UPDATE USER ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to update user",

      error:
        error.message,
    });
  }
};


// =====================================================
// DELETE USER
// =====================================================

const deleteUser = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;


    if (!id) {

      return res.status(400).json({
        success: false,

        message:
          "User ID is required",
      });
    }


    const existingUser =
      await pool.query(
        `
        SELECT id

        FROM users

        WHERE id = $1
        `,
        [id]
      );


    if (
      existingUser.rows.length === 0
    ) {

      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }


    const result =
      await pool.query(
        `
        DELETE FROM users

        WHERE id = $1

        RETURNING id
        `,
        [id]
      );


    res.json({
      success: true,

      message:
        "User deleted successfully",

      deletedUserId:
        result.rows[0].id,
    });

  } catch (error) {

    console.error(
      "ADMIN DELETE USER ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to delete user",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET ADMIN SETTINGS
// =====================================================

const getAdminSettings = async (
  req,
  res
) => {

  try {

    const result =
      await pool.query(`
        SELECT
          id,
          fullname,
          email,
          phone,
          company,
          role

        FROM users

        WHERE LOWER(TRIM(role)) = 'admin'

        ORDER BY id ASC

        LIMIT 1
      `);


    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        success: false,

        message:
          "Admin user not found",
      });
    }


    res.json({
      success: true,

      settings:
        result.rows[0],
    });

  } catch (error) {

    console.error(
      "GET ADMIN SETTINGS ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load admin settings",

      error:
        error.message,
    });
  }
};


// =====================================================
// UPDATE ADMIN SETTINGS
// =====================================================

const updateAdminSettings = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      phone,
      company,
      password,
    } = req.body;


    if (
      !name ||
      !String(name).trim()
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Full name is required",
      });
    }


    if (
      !email ||
      !String(email).trim()
    ) {

      return res.status(400).json({
        success: false,

        message:
          "Email is required",
      });
    }


    const adminResult =
      await pool.query(`
        SELECT id

        FROM users

        WHERE LOWER(TRIM(role)) = 'admin'

        ORDER BY id ASC

        LIMIT 1
      `);


    if (
      adminResult.rows.length === 0
    ) {

      return res.status(404).json({
        success: false,

        message:
          "Admin user not found",
      });
    }


    const adminId =
      adminResult.rows[0].id;


    let result;


    // -------------------------------------------------
    // UPDATE WITH PASSWORD
    // -------------------------------------------------

    if (
      password &&
      String(password).trim()
    ) {

      const hashedPassword =
        await bcrypt.hash(
          String(password),
          10
        );


      result =
        await pool.query(
          `
          UPDATE users

          SET
            fullname = $1,
            email = $2,
            phone = $3,
            company = $4,
            password = $5

          WHERE id = $6

          RETURNING
            id,
            fullname,
            email,
            phone,
            company,
            role
          `,
          [
            String(name).trim(),

            String(email).trim(),

            phone
              ? String(phone).trim()
              : "",

            company
              ? String(company).trim()
              : "",

            hashedPassword,

            adminId,
          ]
        );

    } else {

      // -------------------------------------------------
      // UPDATE WITHOUT PASSWORD
      // -------------------------------------------------

      result =
        await pool.query(
          `
          UPDATE users

          SET
            fullname = $1,
            email = $2,
            phone = $3,
            company = $4

          WHERE id = $5

          RETURNING
            id,
            fullname,
            email,
            phone,
            company,
            role
          `,
          [
            String(name).trim(),

            String(email).trim(),

            phone
              ? String(phone).trim()
              : "",

            company
              ? String(company).trim()
              : "",

            adminId,
          ]
        );
    }


    res.json({
      success: true,

      message:
        "Admin settings updated successfully",

      settings:
        result.rows[0],
    });

  } catch (error) {

    console.error(
      "UPDATE ADMIN SETTINGS ERROR:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to update admin settings",

      error:
        error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  adminTest,

  getDashboardStats,

  getChartStats,

  getRecentActivities,

  getUsers,

  getUserById,

  updateUser,

  deleteUser,

  getAdminSettings,

  updateAdminSettings,
};