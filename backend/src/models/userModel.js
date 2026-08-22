const pool = require("../../db");

// =====================================================
// FIND USER BY EMAIL
// =====================================================

const findByEmail = async (email) => {
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
    WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
};

// =====================================================
// FIND USER BY ID
// =====================================================

const findById = async (id) => {
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
// FIND ALL USERS
// =====================================================

const findAll = async () => {
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
    ORDER BY id DESC
    `
  );

  return result.rows;
};

// =====================================================
// CREATE USER
// =====================================================

const create = async ({
  fullname,
  email,
  password,
  role,
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
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      fullname,
      email,
      role,
      phone,
      location
    `,
    [
      fullname ? fullname.trim() : "",
      email ? email.trim().toLowerCase() : "",
      password,
      role,
      phone || "",
      location || "",
    ]
  );

  return result.rows[0];
};

// =====================================================
// UPDATE BASIC USER PROFILE
// =====================================================

const updateProfile = async ({
  id,
  fullname,
  phone,
  location,
}) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      fullname = $1,
      phone = $2,
      location = $3
    WHERE id = $4
    RETURNING
      id,
      fullname,
      email,
      role,
      phone,
      location
    `,
    [
      fullname ? fullname.trim() : "",
      phone || "",
      location || "",
      id,
    ]
  );

  return result.rows[0] || null;
};

// =====================================================
// DELETE USER
// =====================================================

const remove = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING
      id,
      fullname,
      email,
      role,
      phone,
      location
    `,
    [id]
  );

  return result.rows[0] || null;
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  findByEmail,
  findById,
  findAll,
  create,
  updateProfile,
  remove,
};