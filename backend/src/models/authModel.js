const pool = require("../../db");

// =====================================================
// FIND USER BY EMAIL
// =====================================================

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT
      id,
      fullname,
      email,
      password,
      role,
      phone,
      location
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    `,
    [email.trim().toLowerCase()]
  );

  return result.rows[0] || null;
};

// =====================================================
// CREATE USER
// =====================================================

const createUser = async ({
  fullname,
  email,
  password,
  role = "job_seeker",
  phone,
  location,
}) => {
  const result = await pool.query(
    `
    INSERT INTO users
    (
      fullname,
      email,
      password,
      role,
      phone,
      location
    )
    VALUES
    ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      fullname,
      email,
      role,
      phone,
      location
    `,
    [
      fullname.trim(),
      email.trim().toLowerCase(),
      password,
      role,
      phone || "",
      location || "",
    ]
  );

  return result.rows[0];
};

// =====================================================
// GET USER BY ID
// =====================================================

const getUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
};

// =====================================================
// GET SAFE USER BY ID
// =====================================================

const getSafeUserById = async (id) => {
  const result = await pool.query(
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
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
};

// =====================================================
// UPDATE PASSWORD BY EMAIL
// =====================================================

const updatePasswordByEmail = async (
  email,
  password
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE LOWER(email) = LOWER($2)
    RETURNING
      id,
      fullname,
      email,
      role,
      phone,
      location
    `,
    [
      password,
      email.trim().toLowerCase(),
    ]
  );

  return result.rows[0] || null;
};

// =====================================================
// UPDATE PASSWORD BY USER ID
// =====================================================

const updatePasswordById = async (
  userId,
  password
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE id = $2
    `,
    [
      password,
      userId,
    ]
  );

  return result.rowCount > 0;
};

// =====================================================
// CREATE PASSWORD OTP TABLE
// =====================================================

const createPasswordOtpTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// =====================================================
// DELETE EXISTING OTP
// =====================================================

const deletePasswordOtps = async (email) => {
  await pool.query(
    `
    DELETE FROM password_otps
    WHERE LOWER(email) = LOWER($1)
    `,
    [email.trim().toLowerCase()]
  );
};

// =====================================================
// CREATE PASSWORD OTP
// =====================================================

const createPasswordOtp = async (
  email,
  otp,
  expiresAt
) => {
  const result = await pool.query(
    `
    INSERT INTO password_otps
    (
      email,
      otp,
      expires_at
    )
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [
      email.trim().toLowerCase(),
      otp,
      expiresAt,
    ]
  );

  return result.rows[0];
};

// =====================================================
// FIND VALID OTP
// =====================================================

const findValidOtp = async (
  email,
  otp
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM password_otps
    WHERE LOWER(email) = LOWER($1)
      AND otp = $2
      AND expires_at > CURRENT_TIMESTAMP
    ORDER BY id DESC
    LIMIT 1
    `,
    [
      email.trim().toLowerCase(),
      otp.toString(),
    ]
  );

  return result.rows[0] || null;
};

// =====================================================
// DELETE OTP
// =====================================================

const deleteOtp = async (email) => {
  await pool.query(
    `
    DELETE FROM password_otps
    WHERE LOWER(email) = LOWER($1)
    `,
    [email.trim().toLowerCase()]
  );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  findUserByEmail,
  createUser,
  getUserById,
  getSafeUserById,
  updatePasswordByEmail,
  updatePasswordById,
  createPasswordOtpTable,
  deletePasswordOtps,
  createPasswordOtp,
  findValidOtp,
  deleteOtp,
};