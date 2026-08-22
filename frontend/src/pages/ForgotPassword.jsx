import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import forgotImage from "../assets/forgot.jpg";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =====================================================
  // SEND OTP
  // =====================================================

  const sendOTP = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      alert("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        {
          email: normalizedEmail,
        }
      );

      console.log(
        "FORGOT PASSWORD RESPONSE:",
        res.data
      );

      alert(res.data.message);

      // =================================================
      // PASS EMAIL TO VERIFY OTP PAGE
      // =================================================

      navigate("/verify-otp", {
        state: {
          email: normalizedEmail,
        },
      });
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to send password reset OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const goToLogin = () => {
    navigate("/login");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="forgot-page">

      <div className="forgot-container">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="forgot-left">

          {/* BRAND */}

          <div className="forgot-brand">

            <div className="brand-logo">
              JP
            </div>

            <div>
              <h1>JobPortal</h1>

              <span>
                Find Jobs. Build Future.
              </span>
            </div>

          </div>


          {/* =================================================
              FORGOT PASSWORD IMAGE
          ================================================= */}

          <div className="forgot-illustration">

            <img
              src={forgotImage}
              alt="Forgot password"
            />

          </div>


          {/* MESSAGE */}

          <div className="forgot-message">

            <h3>
              Secure account recovery
            </h3>

            <p>
              We'll send a verification code
              to your registered email address.
            </p>

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="forgot-right">

          <div className="forgot-form">

            {/* ICON */}

            <div className="forgot-icon">
              ✉
            </div>


            {/* HEADING */}

            <h2>
              Forgot Password?
            </h2>

            <p className="subtitle">
              Enter your registered email address
              and we'll send you an OTP to reset
              your password.
            </p>


            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="email"
                />

              </div>

            </div>


            {/* SEND OTP */}

            <button
              type="button"
              className="send-otp-btn"
              onClick={sendOTP}
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send OTP"}
            </button>


            {/* DIVIDER */}

            <div className="forgot-divider">

              <span></span>

              <small>or</small>

              <span></span>

            </div>


            {/* BACK TO LOGIN */}

            <button
              type="button"
              className="back-login-btn"
              onClick={goToLogin}
            >
              <span>←</span>
              Back to Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;