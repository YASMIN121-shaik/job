import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";
import "./ResetPassword.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // GET EMAIL + OTP FROM VERIFY OTP PAGE
  // =====================================================

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const getPasswordStrength = () => {
    if (!password) {
      return {
        label: "",
        level: 0,
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        level: 1,
      };
    }

    if (score <= 3) {
      return {
        label: "Medium",
        level: 2,
      };
    }

    return {
      label: "Strong",
      level: 3,
    };
  };

  const passwordStrength = getPasswordStrength();

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleReset = async (e) => {
    e.preventDefault();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedOtp = otp.trim();

    // ===================================================
    // CHECK EMAIL
    // ===================================================

    if (!normalizedEmail) {
      alert(
        "Email not found. Please verify OTP again."
      );

      navigate("/verify-otp");
      return;
    }

    // ===================================================
    // CHECK OTP
    // ===================================================

    if (!normalizedOtp) {
      alert(
        "OTP not found. Please verify OTP again."
      );

      navigate("/verify-otp", {
        state: {
          email: normalizedEmail,
        },
      });

      return;
    }

    // ===================================================
    // CHECK PASSWORD
    // ===================================================

    if (!password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    // ===================================================
    // PASSWORD MATCH
    // ===================================================

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // ===================================================
    // PASSWORD LENGTH
    // ===================================================

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "RESET PASSWORD REQUEST:",
        {
          email: normalizedEmail,
          otp: normalizedOtp,
        }
      );

      // =================================================
      // SEND EMAIL + OTP + NEW PASSWORD
      // =================================================

      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email: normalizedEmail,
          otp: normalizedOtp,
          newPassword: password,
        }
      );

      console.log(
        "RESET PASSWORD RESPONSE:",
        res.data
      );

      if (res.data.success) {
        alert(
          res.data.message ||
            "Password reset successfully"
        );

        setPassword("");
        setConfirmPassword("");

        navigate("/login");
      }
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="reset-page">

      {/* Background decoration */}

      <div className="reset-bg-shape reset-bg-shape-one"></div>
      <div className="reset-bg-shape reset-bg-shape-two"></div>

      <div className="reset-container">

        {/* =================================================
            HEADER ICON
        ================================================= */}

        <div className="reset-icon">
          <FaLock />
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="reset-header">

          <h2>Create New Password</h2>

          <p>
            Choose a strong password to protect
            your account.
          </p>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="reset-form"
          onSubmit={handleReset}
        >

          {/* =================================================
              NEW PASSWORD
          ================================================= */}

          <div className="reset-field">

            <label htmlFor="new-password">
              New Password
            </label>

            <div className="reset-input-wrapper">

              <FaLock className="reset-input-icon" />

              <input
                id="new-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            {/* Password strength */}

            {password && (
              <div className="password-strength">

                <div className="strength-top">

                  <span>
                    Password strength
                  </span>

                  <strong
                    className={`strength-text strength-${passwordStrength.level}`}
                  >
                    {passwordStrength.label}
                  </strong>

                </div>

                <div className="strength-bars">

                  <span
                    className={
                      passwordStrength.level >= 1
                        ? "active"
                        : ""
                    }
                  ></span>

                  <span
                    className={
                      passwordStrength.level >= 2
                        ? "active"
                        : ""
                    }
                  ></span>

                  <span
                    className={
                      passwordStrength.level >= 3
                        ? "active"
                        : ""
                    }
                  ></span>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div className="reset-field">

            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <div className="reset-input-wrapper">

              <FaLock className="reset-input-icon" />

              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            {/* Password match */}

            {confirmPassword && (
              <div
                className={
                  password === confirmPassword
                    ? "password-match success"
                    : "password-match error"
                }
              >
                {password === confirmPassword ? (
                  <>
                    <FaCheckCircle />
                    Passwords match
                  </>
                ) : (
                  <>
                    Passwords do not match
                  </>
                )}
              </div>
            )}

          </div>

          {/* =================================================
              PASSWORD REQUIREMENTS
          ================================================= */}

          <div className="password-requirements">

            <div className="requirements-title">
              <FaShieldAlt />
              <span>Password requirements</span>
            </div>

            <div className="requirements-list">

              <span
                className={
                  password.length >= 6
                    ? "requirement valid"
                    : "requirement"
                }
              >
                ✓ At least 6 characters
              </span>

              <span
                className={
                  /[A-Z]/.test(password)
                    ? "requirement valid"
                    : "requirement"
                }
              >
                ✓ One uppercase letter
              </span>

              <span
                className={
                  /[0-9]/.test(password)
                    ? "requirement valid"
                    : "requirement"
                }
              >
                ✓ One number
              </span>

            </div>

          </div>

          {/* =================================================
              RESET BUTTON
          ================================================= */}

          <button
            type="submit"
            className="reset-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="reset-spinner"></span>
                Updating Password...
              </>
            ) : (
              <>
                <FaCheckCircle />
                Reset Password
              </>
            )}

          </button>

        </form>

        {/* =================================================
            SECURITY
        ================================================= */}

        <div className="reset-security">

          <FaShieldAlt />

          <span>
            Your password is securely encrypted
            and protected.
          </span>

        </div>

        {/* =================================================
            BACK TO LOGIN
        ================================================= */}

        <button
          type="button"
          className="reset-back-button"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          <FaArrowLeft />
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default ResetPassword;