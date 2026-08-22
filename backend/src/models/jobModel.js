const pool = require("../../db");

// =====================================================
// GET ALL JOBS
// =====================================================

const getAllJobs = async () => {
  const result = await pool.query(`
    SELECT *
    FROM jobs
    ORDER BY id DESC
  `);

  return result.rows;
};

// =====================================================
// GET JOB BY ID
// =====================================================

const getJobById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM jobs
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};

// =====================================================
// CREATE JOB
// =====================================================

const createJob = async (jobData) => {
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
    description_file,
  } = jobData;

  const result = await pool.query(
    `
    INSERT INTO jobs
    (
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
      description_file
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,$15,$16,$17
    )
    RETURNING *
    `,
    [
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
      description_file,
    ]
  );

  return result.rows[0];
};

// =====================================================
// UPDATE JOB
// =====================================================

const updateJob = async (id, jobData) => {
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
  } = jobData;

  const result = await pool.query(
    `
    UPDATE jobs
    SET
      title = $1,
      company = $2,
      location = $3,
      salary = $4,
      experience = $5,
      job_type = $6,
      category = $7,
      department = $8,
      education = $9,
      vacancies = $10,
      skills = $11,
      description = $12,
      responsibilities = $13,
      benefits = $14,
      last_date = $15,
      status = $16
    WHERE id = $17
    RETURNING *
    `,
    [
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
      id,
    ]
  );

  return result.rows[0] || null;
};

// =====================================================
// DELETE JOB
// =====================================================

const deleteJob = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM jobs
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
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};