import "./RegisterPage.css";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import backgroundImage from "../assets/background.jpg";

function Register() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const getPasswordStrength = () => {
    if (!password) {
      return {
        level: 0,
        text: "",
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
        level: 1,
        text: "Weak",
      };
    }

    if (score <= 3) {
      return {
        level: 2,
        text: "Medium",
      };
    }

    return {
      level: 3,
      text: "Strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullname.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!role) {
      alert("Please select your role.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          fullname: fullname.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }
      );

      if (response.data.success) {
        alert(
          response.data.message ||
            "Registration successful!"
        );

        setFullname("");
        setEmail("");
        setPassword("");
        setRole("");

        navigate("/login");
      } else {
        alert(
          response.data.message ||
            "Registration failed."
        );
      }
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      if (error.response) {
        alert(
          error.response.data?.message ||
            error.response.data?.error ||
            "Registration failed."
        );
      } else if (error.request) {
        alert(
          "Cannot connect to the backend server. Please make sure your backend is running on port 5000."
        );
      } else {
        alert(
          error.message ||
            "Registration failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{
        "--register-bg": `url(${backgroundImage})`,
      }}
    >

      {/* =====================================================
          DECORATIVE ELEMENTS
      ===================================================== */}

      <div className="register-orb register-orb-one"></div>
      <div className="register-orb register-orb-two"></div>
      <div className="register-orb register-orb-three"></div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <main className="register-container">

        {/* ===================================================
            LEFT INFORMATION CARD
        =================================================== */}

        <section className="register-left">

          {/* Brand */}

          <div className="register-brand">

            <div className="register-brand-icon">
              <i className="bi bi-briefcase-fill"></i>
            </div>

            <div>
              <strong>Job Portal</strong>
              <span>
                Career opportunities
              </span>
            </div>

          </div>

          {/* Main Content */}

          <div className="register-left-content">

            <span className="register-badge">
              <i className="bi bi-stars"></i>
              START YOUR JOURNEY
            </span>

            <h1>
              Build your
              <br />
              <span>career future.</span>
            </h1>

            <p>
              Create your account and discover
              meaningful opportunities that match
              your skills, experience and career
              goals.
            </p>

          </div>

          {/* Benefits */}

          <div className="register-benefits">

            <div className="benefit-item">

              <div className="benefit-icon">
                <i className="bi bi-search"></i>
              </div>

              <div>
                <strong>
                  Discover Opportunities
                </strong>

                <span>
                  Find jobs that match your profile.
                </span>
              </div>

            </div>

            <div className="benefit-item">

              <div className="benefit-icon">
                <i className="bi bi-person-check"></i>
              </div>

              <div>
                <strong>
                  Build Your Profile
                </strong>

                <span>
                  Showcase your skills and experience.
                </span>
              </div>

            </div>

            <div className="benefit-item">

              <div className="benefit-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>

              <div>
                <strong>
                  Grow Your Career
                </strong>

                <span>
                  Take the next step toward your goals.
                </span>
              </div>

            </div>

          </div>

          {/* Statistics */}

          <div className="register-stats">

            <div>
              <strong>10K+</strong>
              <span>Opportunities</span>
            </div>

            <div>
              <strong>2K+</strong>
              <span>Employers</span>
            </div>

            <div>
              <strong>5K+</strong>
              <span>Professionals</span>
            </div>

          </div>

        </section>

        {/* ===================================================
            RIGHT REGISTER CARD
        =================================================== */}

        <section className="register-right">

          {/* Home */}

          <Link
            to="/"
            className="register-home"
          >
            <i className="bi bi-arrow-left"></i>
            Home
          </Link>

          {/* Header */}

          <div className="register-header">

            <span className="register-welcome">
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Join our platform and start
              exploring new opportunities.
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleRegister}
            className="register-form"
          >

            {/* Full Name */}

            <div className="register-field">

              <label htmlFor="fullname">
                Full Name
              </label>

              <div className="register-input-wrapper">

                <i className="bi bi-person register-input-icon"></i>

                <input
                  id="fullname"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullname}
                  onChange={(e) =>
                    setFullname(e.target.value)
                  }
                  autoComplete="name"
                  disabled={loading}
                />

              </div>

            </div>

            {/* Email */}

            <div className="register-field">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="register-input-wrapper">

                <i className="bi bi-envelope register-input-icon"></i>

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

            {/* Role */}

            <div className="register-field">

              <label htmlFor="role">
                Account Type
              </label>

              <div className="register-input-wrapper">

                <i className="bi bi-person-badge register-input-icon"></i>

                <select
                  id="role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  disabled={loading}
                >
                  <option value="">
                    Choose your account type
                  </option>

                  <option value="job_seeker">
                    Job Seeker
                  </option>

                  <option value="job_holder">
                    Job Holder
                  </option>
                </select>

                <i className="bi bi-chevron-down select-arrow"></i>

              </div>

            </div>

            {/* Password */}

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">

                <i className="bi bi-lock register-input-icon"></i>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="register-password-toggle"
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
                  <i
                    className={
                      showPassword
                        ? "bi bi-eye-slash-fill"
                        : "bi bi-eye-fill"
                    }
                  ></i>
                </button>

              </div>

              {/* Strength */}

              {password && (
                <div className="register-strength">

                  <div className="strength-header">

                    <span>
                      Password strength
                    </span>

                    <strong
                      className={`strength-label strength-${passwordStrength.level}`}
                    >
                      {passwordStrength.text}
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

              <div className="password-hint">
                <i className="bi bi-info-circle"></i>
                Minimum 6 characters
              </div>

            </div>

            {/* Button */}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <i className="bi bi-arrow-right"></i>
                </>
              )}

            </button>

          </form>

          {/* Login */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign In
              <i className="bi bi-arrow-right"></i>
            </Link>

          </div>

          {/* Security */}

          <div className="register-security">

            <div className="security-icon">
              <i className="bi bi-shield-check"></i>
            </div>

            <div>
              <strong>
                Secure registration
              </strong>

              <span>
                Your account information is protected
                with secure authentication.
              </span>
            </div>

          </div>

          {/* Footer */}

          <div className="register-footer">
            © 2026 Job Portal · All rights reserved.
          </div>

        </section>

      </main>

    </div>
  );
}

export default Register;