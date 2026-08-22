const pool = require("../../db");

// =====================================================
// CREATE JOB HOLDER
// =====================================================

const createJobHolder = async ({
  fullname,
  email,
  phone,
  company,
  password,
}) => {
  const result = await pool.query(
    `
    INSERT INTO users
    (
      fullname,
      email,
      phone,
      company,
      password,
      role
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      'job_holder'
    )
    RETURNING
      id,
      fullname,
      email,
      phone,
      company,
      location,
      role
    `,
    [
      fullname,
      email,
      phone || "",
      company || "",
      password,
    ]
  );

  return result.rows[0];
};

// =====================================================
// GET ALL JOB HOLDERS
// =====================================================

const getAllJobHolders = async () => {
  const result = await pool.query(
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
    WHERE LOWER(TRIM(role)) = 'job_holder'
    ORDER BY id DESC
    `
  );

  return result.rows;
};

// =====================================================
// GET JOB HOLDER BY ID
// =====================================================

const getJobHolderById = async (id) => {
  const result = await pool.query(
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
      AND LOWER(TRIM(role)) = 'job_holder'
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0];
};

// =====================================================
// UPDATE JOB HOLDER
// =====================================================

const updateJobHolder = async (
  id,
  {
    fullname,
    email,
    phone,
    company,
    location,
  }
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      fullname = $1,
      email = $2,
      phone = $3,
      company = $4,
      location = $5
    WHERE id = $6
      AND LOWER(TRIM(role)) = 'job_holder'
    RETURNING
      id,
      fullname,
      email,
      phone,
      company,
      location,
      role
    `,
    [
      fullname,
      email,
      phone || "",
      company || "",
      location || "",
      id,
    ]
  );

  return result.rows[0];
};

// =====================================================
// DELETE JOB HOLDER
// =====================================================

const deleteJobHolder = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
      AND LOWER(TRIM(role)) = 'job_holder'
    RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createJobHolder,
  getAllJobHolders,
  getJobHolderById,
  updateJobHolder,
  deleteJobHolder,
};