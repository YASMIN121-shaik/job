import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaUserShield,
  FaKey,
} from "react-icons/fa";

import "./VerifyOTP.css";

import backgroundImage from "../assets/background.jpg";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromPreviousPage =
    location.state?.email || "";

  const [email, setEmail] = useState(
    emailFromPreviousPage
  );

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOTP = async () => {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedOtp = otp.trim();

    if (!normalizedEmail) {
      alert("Please enter your email.");
      return;
    }

    if (!normalizedOtp) {
      alert("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email: normalizedEmail,
          otp: normalizedOtp,
        }
      );

      console.log(
        "VERIFY OTP RESPONSE:",
        res.data
      );

      if (res.data.success) {
        alert(
          res.data.message ||
            "OTP verified successfully"
        );

        navigate("/reset-password", {
          state: {
            email: normalizedEmail,
            otp: normalizedOtp,
          },
        });
      }
    } catch (error) {
      console.error(
        "VERIFY OTP ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="verify-page"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* =================================================
          BACKGROUND OVERLAY
      ================================================= */}

      <div className="verify-background-overlay"></div>

      {/* =================================================
          DECORATIVE SHAPES
      ================================================= */}

      <div className="verify-floating-shape shape-one"></div>
      <div className="verify-floating-shape shape-two"></div>
      <div className="verify-floating-shape shape-three"></div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="verify-card">

        {/* =================================================
            CARD TOP BRAND
        ================================================= */}

        <div className="verify-brand">

          <div className="verify-brand-icon">
            <FaKey />
          </div>

          <div className="verify-brand-text">
            <strong>Job Portal</strong>
            <span>Secure Account Verification</span>
          </div>

        </div>

        {/* =================================================
            MAIN ICON
        ================================================= */}

        <div className="verify-icon-container">

          <div className="verify-icon-ring">
            <div className="verify-icon">
              <FaShieldAlt />
            </div>
          </div>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="verify-header">

          <span className="verify-eyebrow">
            <FaUserShield />
            ACCOUNT SECURITY
          </span>

          <h1>
            Verify your account
          </h1>

          <p>
            We have sent a 6-digit verification
            code to your registered email address.
            Enter the code below to continue.
          </p>

        </div>

        {/* =================================================
            EMAIL INFORMATION
        ================================================= */}

        <div className="verify-email-info">

          <div className="verify-email-icon">
            <FaEnvelope />
          </div>

          <div className="verify-email-content">

            <span>Verification email sent to</span>

            <strong>
              {email || "your email address"}
            </strong>

          </div>

          <FaCheckCircle className="verify-email-check" />

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <div className="verify-form">

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="verify-field">

            <label htmlFor="verify-email">
              Email Address
            </label>

            <div className="verify-input-wrapper">

              <FaEnvelope className="verify-input-icon" />

              <input
                id="verify-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                disabled={loading}
              />

            </div>

          </div>

          {/* =================================================
              OTP
          ================================================= */}

          <div className="verify-field">

            <div className="otp-label-row">

              <label htmlFor="verify-otp">
                Verification Code
              </label>

              <span>
                6 digits
              </span>

            </div>

            <div className="verify-input-wrapper otp-wrapper">

              <FaLock className="verify-input-icon" />

              <input
                id="verify-otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                maxLength={6}
                autoComplete="one-time-code"
                disabled={loading}
              />

              <div className="otp-count">
                {otp.length}/6
              </div>

            </div>

            <div className="otp-helper">
              <FaLock />
              Enter the one-time password sent to your email.
            </div>

          </div>

          {/* =================================================
              VERIFY BUTTON
          ================================================= */}

          <button
            type="button"
            className="verify-button"
            onClick={verifyOTP}
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="verify-spinner"></span>
                Verifying...
              </>
            ) : (
              <>
                <FaCheckCircle />
                Verify OTP
              </>
            )}

          </button>

        </div>

        {/* =================================================
            SECURITY INFORMATION
        ================================================= */}

        <div className="verify-security">

          <div className="security-icon">
            <FaShieldAlt />
          </div>

          <div className="security-content">

            <strong>
              Secure verification
            </strong>

            <span>
              Your verification code is encrypted
              and used only to protect your account.
            </span>

          </div>

        </div>

        {/* =================================================
            EXTRA INFORMATION
        ================================================= */}

        <div className="verify-notice">

          <div className="notice-icon">
            <FaClock />
          </div>

          <div>

            <strong>
              Verification code expires soon
            </strong>

            <span>
              For your security, please use the
              latest OTP sent to your email.
            </span>

          </div>

        </div>

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="verify-back-button"
          onClick={() =>
            navigate("/forgot-password")
          }
          disabled={loading}
        >
          <FaArrowLeft />
          Back to Forgot Password
        </button>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="verify-footer">
          © 2026 Job Portal · Secure authentication
        </div>

      </div>
    </div>
  );
}

export default VerifyOTP;