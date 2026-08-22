import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import loginImage from "../assets/login.jpg";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: cleanEmail,
          password: password,
        }
      );

      const user = response.data.user;

      if (!user) {
        alert(
          "Login successful, but user information was not received."
        );
        return;
      }

      // =====================================================
      // SAVE USER INFORMATION
      // =====================================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "token",
        response.data.token || ""
      );

      localStorage.setItem(
        "userId",
        String(user.id || "")
      );

      localStorage.setItem(
        "userRole",
        user.role || ""
      );

      localStorage.setItem(
        "userEmail",
        user.email || cleanEmail
      );

      // =====================================================
      // ROLE BASED NAVIGATION
      // =====================================================

      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;

        case "manager":
          navigate("/manager-dashboard");
          break;

        case "job_seeker":
          navigate("/job-seeker");
          break;

        case "job_holder":
          navigate("/jobholder");
          break;

        default:
          alert(
            "Login successful, but the user role is not recognized: " +
              user.role
          );
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error.response) {
        const message =
          error.response.data?.message ||
          "Invalid email or password.";

        alert(message);
      } else if (error.request) {
        alert(
          "Cannot connect to the server. Please make sure your backend is running on port 5000."
        );
      } else {
        alert("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =====================================================
          LEFT CAREER CARD
      ===================================================== */}

      <section className="career-card-wrapper">

        <div className="career-card">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="career-brand">

            <div className="career-brand-icon">
              <i className="bi bi-briefcase-fill"></i>
            </div>

            <div>
              <strong>Job Portal</strong>
              <span>Career opportunities</span>
            </div>

          </div>


          {/* =================================================
              IMAGE
          ================================================= */}

          <div className="career-image">

            <img
              src={loginImage}
              alt="Career opportunities"
            />

            <div className="career-image-overlay"></div>

            <div className="career-image-content">

              <span>
                <i className="bi bi-stars"></i>
                BUILD YOUR FUTURE
              </span>

              <strong>
                Your next opportunity
                <br />
                starts here.
              </strong>

            </div>

          </div>


          {/* =================================================
              CAREER CONTENT
          ================================================= */}

          <div className="career-content">

            <span className="career-eyebrow">

              <i className="bi bi-stars"></i>

              FIND YOUR PATH

            </span>


            <h1>

              Discover your

              <br />

              <span>dream career.</span>

            </h1>


            <p>
              Connect with trusted employers, discover
              meaningful opportunities, and take the next
              step toward your professional future.
            </p>


            {/* =================================================
                FEATURES
            ================================================= */}

            <div className="career-features">

              {/* Feature 1 */}

              <div className="career-feature">

                <div className="career-feature-icon">

                  <i className="bi bi-search"></i>

                </div>

                <div>

                  <strong>
                    Discover Opportunities
                  </strong>

                  <span>
                    Find jobs that match your skills.
                  </span>

                </div>

              </div>


              {/* Feature 2 */}

              <div className="career-feature">

                <div className="career-feature-icon">

                  <i className="bi bi-building"></i>

                </div>

                <div>

                  <strong>
                    Connect With Employers
                  </strong>

                  <span>
                    Explore companies and career paths.
                  </span>

                </div>

              </div>


              {/* Feature 3 */}

              <div className="career-feature">

                <div className="career-feature-icon">

                  <i className="bi bi-graph-up-arrow"></i>

                </div>

                <div>

                  <strong>
                    Grow Your Career
                  </strong>

                  <span>
                    Turn your goals into opportunities.
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              CAREER STATS
          ================================================= */}

          <div className="career-stats">

            <div>

              <strong>10K+</strong>

              <span>
                Job Opportunities
              </span>

            </div>


            <div>

              <strong>2K+</strong>

              <span>
                Trusted Employers
              </span>

            </div>


            <div>

              <strong>5K+</strong>

              <span>
                Professionals
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          RIGHT LOGIN CARD
      ===================================================== */}

      <section className="login-card-wrapper">

        <div className="login-card">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="card-brand">

            <div className="card-brand-icon">

              <i className="bi bi-briefcase-fill"></i>

            </div>

            <div>

              <strong>
                Job Portal
              </strong>

              <span>
                Career opportunities
              </span>

            </div>

          </div>


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="login-header">

            <span className="login-welcome">
              Welcome back
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your details below to continue.
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="login-field">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="login-input-wrapper">

                <i className="bi bi-envelope login-input-icon"></i>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
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
                PASSWORD
            ================================================= */}

            <div className="login-field">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="forgot-password"
                >
                  Forgot password?
                </Link>

              </div>


              <div className="login-input-wrapper">

                <i className="bi bi-lock login-input-icon"></i>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  disabled={loading}
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  <i
                    className={
                      showPassword
                        ? "bi bi-eye-slash-fill"
                        : "bi bi-eye-fill"
                    }
                  ></i>

                </button>

              </div>

            </div>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <i className="bi bi-arrow-right"></i>
                </>
              )}

            </button>

          </form>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="login-divider">

            <span>
              NEW TO JOB PORTAL?
            </span>

          </div>


          {/* =================================================
              SIGN UP
          ================================================= */}

          <div className="signup">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">

              Create an account

              <i className="bi bi-arrow-up-right"></i>

            </Link>

          </div>


          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="login-security">

            <div className="security-icon">

              <i className="bi bi-shield-check"></i>

            </div>

            <div>

              <strong>
                Secure sign in
              </strong>

              <span>
                Your account information is protected
                with secure authentication.
              </span>

            </div>

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="login-bottom-text">

            © 2026 Job Portal · All rights reserved.

          </div>

        </div>

      </section>

    </div>
  );
}

export default LoginPage;