const pool = require("../../db");

// =====================================================
// CREATE SUPPORT REQUEST
// =====================================================

const create = async ({
  email,
  subject,
  message,
  category,
  recipient,
}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO support_requests
      (
        email,
        subject,
        message,
        category,
        recipient,
        status,
        created_at,
        updated_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        'pending',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *
      `,
      [
        email,
        subject || "",
        message,
        category || "general",
        recipient || "admin",
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "SUPPORT MODEL CREATE ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET ALL SUPPORT REQUESTS
// =====================================================

const findAll = async () => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM support_requests
      ORDER BY id DESC
      `
    );

    return result.rows;
  } catch (error) {
    console.error(
      "SUPPORT MODEL FIND ALL ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET ADMIN SUPPORT REQUESTS
// =====================================================

const findAdminRequests = async () => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM support_requests
      WHERE LOWER(recipient) = 'admin'
      ORDER BY id DESC
      `
    );

    return result.rows;
  } catch (error) {
    console.error(
      "SUPPORT MODEL ADMIN ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET MANAGER SUPPORT REQUESTS
// =====================================================

const findManagerRequests = async () => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM support_requests
      WHERE LOWER(recipient) = 'manager'
      ORDER BY id DESC
      `
    );

    return result.rows;
  } catch (error) {
    console.error(
      "SUPPORT MODEL MANAGER ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET JOB SEEKER REQUESTS
// =====================================================

const findByEmail = async (email) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM support_requests
      WHERE LOWER(TRIM(email)) =
            LOWER(TRIM($1))
      ORDER BY id DESC
      `,
      [email]
    );

    return result.rows;
  } catch (error) {
    console.error(
      "SUPPORT MODEL EMAIL ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// GET BY ID
// =====================================================

const findById = async (id) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM support_requests
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error(
      "SUPPORT MODEL FIND BY ID ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// UPDATE STATUS
// =====================================================

const updateStatus = async (id, status) => {
  try {
    const result = await pool.query(
      `
      UPDATE support_requests
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error(
      "SUPPORT MODEL UPDATE STATUS ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// DELETE
// =====================================================

const remove = async (id) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM support_requests
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error(
      "SUPPORT MODEL DELETE ERROR:",
      error
    );

    throw error;
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  create,
  findAll,
  findAdminRequests,
  findManagerRequests,
  findByEmail,
  findById,
  updateStatus,
  remove,
};