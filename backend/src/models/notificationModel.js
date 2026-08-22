const pool = require("../../db");

// =====================================================
// GET ALL NOTIFICATIONS
// =====================================================

const findByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT
      id,
      email,
      type,
      title,
      message,
      is_read,
      created_at
    FROM notifications
    WHERE LOWER(TRIM(email)) =
          LOWER(TRIM($1))
    ORDER BY created_at DESC, id DESC
    `,
    [email]
  );

  return result.rows;
};


// =====================================================
// GET UNREAD COUNT
// =====================================================

const getUnreadCount = async (email) => {
  const result = await pool.query(
    `
    SELECT COUNT(*)::INTEGER AS unread_count
    FROM notifications
    WHERE LOWER(TRIM(email)) =
          LOWER(TRIM($1))
    AND is_read = FALSE
    `,
    [email]
  );

  return result.rows[0].unread_count;
};


// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async ({
  email,
  type = "system",
  title,
  message,
}) => {
  try {
    if (
      !email ||
      !email.trim() ||
      !title ||
      !message
    ) {
      throw new Error(
        "Email, title and message are required"
      );
    }

    const result = await pool.query(
      `
      INSERT INTO notifications
      (
        email,
        type,
        title,
        message,
        is_read,
        created_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        FALSE,
        CURRENT_TIMESTAMP
      )
      RETURNING *
      `,
      [
        email.trim().toLowerCase(),
        type,
        title.trim(),
        message.trim(),
      ]
    );

    console.log(
      "Notification inserted:",
      result.rows[0]
    );

    return result.rows[0];

  } catch (error) {
    console.error(
      "CREATE NOTIFICATION MODEL ERROR:",
      error
    );

    throw error;
  }
};


// =====================================================
// MARK ONE AS READ
// =====================================================

const markAsRead = async (id) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0] || null;
};


// =====================================================
// MARK ALL AS READ
// =====================================================

const markAllAsRead = async (email) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET is_read = TRUE
    WHERE LOWER(TRIM(email)) =
          LOWER(TRIM($1))
    AND is_read = FALSE
    `,
    [email]
  );

  return result.rowCount;
};


// =====================================================
// DELETE NOTIFICATION
// =====================================================

const remove = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM notifications
    WHERE id = $1
    RETURNING *
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
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  remove,
};