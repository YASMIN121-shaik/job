const pool = require("../../db");

const findById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM applications
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
};

const findByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT *
    FROM applications
    WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
    ORDER BY applied_at DESC, id DESC
    `,
    [email]
  );

  return result.rows;
};

const findAll = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM applications
    ORDER BY applied_at DESC, id DESC
    `
  );

  return result.rows;
};

const updateStatus = async (id, status) => {
  const result = await pool.query(
    `
    UPDATE applications
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );

  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM applications
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  findById,
  findByEmail,
  findAll,
  updateStatus,
  remove,
};