const pool = require("../../db");
const authModel = require("../models/authModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// =====================================================
// HELPER
// =====================================================

const safeUser = (user) => ({
  id: user.id,
  fullname: user.fullname || "",
  email: user.email || "",
  role: user.role || "",
  phone: user.phone || "",
  location: user.location || "",
});

// =====================================================
// NORMALIZE EMAIL
// =====================================================

const normalizeEmail = (email) => {
  return String(email || "").trim().toLowerCase();
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

const register = async (req, res) => {
  try {
    const {
      fullname,
      email,
      password,
      role = "jobseeker",
      phone,
      location,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Fullname, email and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // -------------------------------------------------
    // CHECK EXISTING USER
    // -------------------------------------------------

    const existingUser =
      await authModel.findUserByEmail(
        normalizedEmail
      );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // -------------------------------------------------
    // HASH PASSWORD
    // -------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // -------------------------------------------------
    // CREATE USER
    // -------------------------------------------------

    const user = await authModel.createUser({
      fullname,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      phone,
      location,
    });

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: safeUser(user),
    });

  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      normalizeEmail(email);

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user =
      await authModel.findUserByEmail(
        normalizedEmail
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // CHECK PASSWORD
    // -------------------------------------------------

    let passwordMatch = false;

    try {
      passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );
    } catch (bcryptError) {
      console.error(
        "BCRYPT COMPARE ERROR:",
        bcryptError
      );

      passwordMatch =
        password === user.password;
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // -------------------------------------------------
    // JWT SECRET
    // -------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is missing in .env"
      );

      return res.status(500).json({
        success: false,
        message:
          "JWT_SECRET is not configured",
      });
    }

    // -------------------------------------------------
    // CREATE JWT
    // -------------------------------------------------

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      normalizeEmail(email);

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user =
      await authModel.findUserByEmail(
        normalizedEmail
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email",
      });
    }

    // -------------------------------------------------
    // GENERATE OTP
    // -------------------------------------------------

    const otp = Math.floor(
      100000 +
        Math.random() * 900000
    ).toString();

    // -------------------------------------------------
    // OTP EXPIRATION
    // -------------------------------------------------

    const expiresAt = new Date(
      Date.now() +
        10 * 60 * 1000
    );

    // -------------------------------------------------
    // CREATE OTP TABLE
    // -------------------------------------------------

    await authModel.createPasswordOtpTable();

    // -------------------------------------------------
    // DELETE OLD OTP
    // -------------------------------------------------

    await authModel.deletePasswordOtps(
      normalizedEmail
    );

    // -------------------------------------------------
    // SAVE NEW OTP
    // -------------------------------------------------

    await authModel.createPasswordOtp(
      normalizedEmail,
      otp,
      expiresAt
    );

    // -------------------------------------------------
    // CHECK EMAIL CONFIG
    // -------------------------------------------------

    if (!process.env.EMAIL_USER) {
      console.error(
        "❌ EMAIL_USER is missing from .env"
      );

      await authModel.deletePasswordOtps(
        normalizedEmail
      );

      return res.status(500).json({
        success: false,
        message:
          "EMAIL_USER is not configured",
      });
    }

    if (!process.env.EMAIL_PASS) {
      console.error(
        "❌ EMAIL_PASS is missing from .env"
      );

      await authModel.deletePasswordOtps(
        normalizedEmail
      );

      return res.status(500).json({
        success: false,
        message:
          "EMAIL_PASS is not configured",
      });
    }

    // -------------------------------------------------
    // GMAIL TRANSPORTER
    // -------------------------------------------------

    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

    console.log(
      "📧 Email user:",
      process.env.EMAIL_USER
    );

    console.log(
      "📧 Sending OTP to:",
      normalizedEmail
    );

    // -------------------------------------------------
    // VERIFY SMTP CONNECTION
    // -------------------------------------------------

    await transporter.verify();

    console.log(
      "✅ Gmail SMTP connection successful"
    );

    // -------------------------------------------------
    // SEND OTP EMAIL
    // -------------------------------------------------

    const mailResult =
      await transporter.sendMail({
        from:
          `"Job Portal" <${process.env.EMAIL_USER}>`,

        to: normalizedEmail,

        subject:
          "Job Portal - Password Reset OTP",

        text:
          `Hello ${user.fullname || "User"},\n\n` +
          `Your Job Portal password reset OTP is: ${otp}\n\n` +
          `This OTP will expire in 10 minutes.\n\n` +
          `If you did not request a password reset, please ignore this email.\n\n` +
          `Regards,\n` +
          `Job Portal`,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            background: #f5f7fb;
            padding: 30px;
          ">

            <div style="
              max-width: 600px;
              margin: auto;
              background: white;
              padding: 30px;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
            ">

              <h2 style="
                color: #16a34a;
                margin-top: 0;
              ">
                Job Portal
              </h2>

              <p>
                Hello ${
                  user.fullname || "User"
                },
              </p>

              <p>
                We received a request to
                reset your password.
              </p>

              <p>
                Your password reset OTP is:
              </p>

              <div style="
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #15803d;
                background: #f0fdf4;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
              ">
                ${otp}
              </div>

              <p>
                This OTP will expire in
                <strong>10 minutes</strong>.
              </p>

              <p style="
                color: #6b7280;
                font-size: 14px;
              ">
                If you did not request a
                password reset, please ignore
                this email.
              </p>

              <hr style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 25px 0;
              ">

              <p style="
                color: #9ca3af;
                font-size: 13px;
              ">
                Job Portal
              </p>

            </div>

          </div>
        `,
      });

    console.log(
      "✅ OTP email sent successfully"
    );

    console.log(
      "📨 Message ID:",
      mailResult.messageId
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      message:
        "OTP sent to your email",
      email: normalizedEmail,
    });

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "❌ FORGOT PASSWORD ERROR"
    );

    console.error(
      "======================================"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Code:",
      error.code
    );

    console.error(
      "Command:",
      error.command
    );

    console.error(
      "Response:",
      error.response
    );

    console.error(
      "Response Code:",
      error.responseCode
    );

    console.error(
      "======================================"
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send password reset OTP",
      error: error.message,
    });
  }
};

// =====================================================
// VERIFY OTP
// POST /api/auth/verify-otp
// =====================================================

const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    const normalizedEmail =
      normalizeEmail(email);

    // -------------------------------------------------
    // FIND VALID OTP
    // -------------------------------------------------

    const otpRecord =
      await authModel.findValidOtp(
        normalizedEmail,
        otp
      );

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired OTP",
      });
    }

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.json({
      success: true,
      message:
        "OTP verified successfully",
    });

  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify OTP",
      error: error.message,
    });
  }
};

// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      password,
      newPassword,
    } = req.body;

    // -------------------------------------------------
    // SUPPORT BOTH PASSWORD NAMES
    // -------------------------------------------------

    const finalPassword =
      newPassword || password;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !email ||
      !otp ||
      !finalPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    const normalizedEmail =
      normalizeEmail(email);

    // -------------------------------------------------
    // VERIFY OTP
    // -------------------------------------------------

    const otpRecord =
      await authModel.findValidOtp(
        normalizedEmail,
        otp
      );

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired OTP",
      });
    }

    // -------------------------------------------------
    // HASH PASSWORD
    // -------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        finalPassword,
        10
      );

    // -------------------------------------------------
    // UPDATE PASSWORD
    // -------------------------------------------------

    const updatedUser =
      await authModel.updatePasswordByEmail(
        normalizedEmail,
        hashedPassword
      );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------
    // DELETE USED OTP
    // -------------------------------------------------

    await authModel.deleteOtp(
      normalizedEmail
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      message:
        "Password reset successfully",
      user: safeUser(updatedUser),
    });

  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reset password",
      error: error.message,
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {
    const {
      userId,
    } = req.params;

    const {
      currentPassword,
      oldPassword,
      newPassword,
      password,
    } = req.body;

    // -------------------------------------------------
    // SUPPORT MULTIPLE FIELD NAMES
    // -------------------------------------------------

    const current =
      currentPassword ||
      oldPassword;

    const newPass =
      newPassword ||
      password;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!current || !newPass) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user =
      await authModel.getUserById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------
    // CHECK CURRENT PASSWORD
    // -------------------------------------------------

    let passwordMatch = false;

    try {
      passwordMatch =
        await bcrypt.compare(
          current,
          user.password
        );
    } catch (error) {
      console.error(
        "BCRYPT ERROR:",
        error
      );

      passwordMatch =
        current === user.password;
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // -------------------------------------------------
    // HASH NEW PASSWORD
    // -------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPass,
        10
      );

    // -------------------------------------------------
    // UPDATE PASSWORD
    // -------------------------------------------------

    const updated =
      await authModel.updatePasswordById(
        userId,
        hashedPassword
      );

    if (!updated) {
      return res.status(500).json({
        success: false,
        message:
          "Password update failed",
      });
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change password",
      error: error.message,
    });
  }
};

// =====================================================
// GET CURRENT USER
// GET /api/auth/user/:id
// =====================================================

const getCurrentUser = async (req, res) => {
  try {
    const {
      id,
    } = req.params;

    // -------------------------------------------------
    // FIND SAFE USER
    // -------------------------------------------------

    const user =
      await authModel.getSafeUserById(
        id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch current user",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  getCurrentUser,
};