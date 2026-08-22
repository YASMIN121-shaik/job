const pool = require("../../db");
const bcrypt = require("bcrypt");

// =====================================================
// GET MANAGER PROFILE
// GET /api/manager/profile/:id
// =====================================================

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        role,
        phone,
        company,
        designation,
        location
      FROM users
      WHERE id = $1
      AND LOWER(role) IN ('manager', 'job_holder')
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("GET MANAGER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE MANAGER PROFILE
// PUT /api/manager/profile/:id
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullname,
      email,
      phone,
      company,
      designation,
      location,
    } = req.body;

    console.log("=================================");
    console.log("UPDATE MANAGER PROFILE");
    console.log("USER ID:", id);
    console.log("REQUEST BODY:", req.body);
    console.log("=================================");

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!fullname || !fullname.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanFullname = fullname.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : "";
    const cleanCompany = company ? company.trim() : "";
    const cleanDesignation = designation
      ? designation.trim()
      : "";
    const cleanLocation = location
      ? location.trim()
      : "";

    // =================================================
    // CHECK USER EXISTS
    // =================================================

    const userCheck = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // CHECK EMAIL DUPLICATE
    // =================================================

    const emailCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
      AND id <> $2
      LIMIT 1
      `,
      [cleanEmail, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email address is already being used",
      });
    }

    // =================================================
    // UPDATE DATABASE
    // =================================================

    const result = await pool.query(
      `
      UPDATE users
      SET
        fullname = $1,
        email = $2,
        phone = $3,
        company = $4,
        designation = $5,
        location = $6
      WHERE id = $7
      RETURNING
        id,
        fullname,
        email,
        role,
        phone,
        company,
        designation,
        location
      `,
      [
        cleanFullname,
        cleanEmail,
        cleanPhone,
        cleanCompany,
        cleanDesignation,
        cleanLocation,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile could not be updated",
      });
    }

    console.log("PROFILE SAVED TO DATABASE:");
    console.log(result.rows[0]);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE MANAGER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// PUT /api/manager/profile/:id/password
// =====================================================

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all password fields",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    const result = await pool.query(
      `
      SELECT id, password
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [hashedPassword, id]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE MANAGER ACCOUNT
// DELETE /api/manager/profile/:id
// =====================================================

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete account",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};