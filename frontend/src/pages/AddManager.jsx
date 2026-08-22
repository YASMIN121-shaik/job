import React, { useState } from "react";
import axios from "axios";
import "./AddManager.css";

const API_URL = "http://localhost:5000";

// =====================================================
// ADD MANAGER
// =====================================================

function AddManager() {
  const [manager, setManager] = useState({
    fullname: "",
    email: "",
    phone: "",
    company: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ===================================================
  // HANDLE INPUT CHANGE
  // ===================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setManager((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===================================================
  // GET AUTH TOKEN
  // ===================================================

  const getToken = () => {
    // Most common key
    let token = localStorage.getItem("token");

    // Fallback keys in case your LoginPage uses another key
    if (!token) {
      token = localStorage.getItem("authToken");
    }

    if (!token) {
      token = localStorage.getItem("accessToken");
    }

    return token;
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    const fullname = manager.fullname.trim();
    const email = manager.email.trim().toLowerCase();
    const phone = manager.phone.trim();
    const company = manager.company.trim();
    const password = manager.password;

    if (!fullname || !email || !password) {
      alert("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // -------------------------------------------------
    // GET TOKEN
    // -------------------------------------------------

    const token = getToken();

    if (!token) {
      alert(
        "Authentication token is missing.\n\n" +
          "Please login again as Admin and try again."
      );

      return;
    }

    // -------------------------------------------------
    // API REQUEST
    // -------------------------------------------------

    try {
      setLoading(true);

      console.log(
        "Creating manager..."
      );

      console.log(
        "Token found:",
        token ? "YES" : "NO"
      );

      const response = await axios.post(
        `${API_URL}/api/manager/create`,
        {
          fullname,
          email,
          phone,
          company,
          password,

          // IMPORTANT
          role: "manager",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "CREATE MANAGER RESPONSE:",
        response.data
      );

      if (
        response.data &&
        response.data.success
      ) {
        alert(
          response.data.message ||
            "Manager created successfully."
        );

        // -------------------------------------------------
        // CLEAR FORM
        // -------------------------------------------------

        setManager({
          fullname: "",
          email: "",
          phone: "",
          company: "",
          password: "",
        });
      } else {
        alert(
          response.data?.message ||
            "Failed to create manager."
        );
      }
    } catch (error) {
      console.error(
        "CREATE MANAGER ERROR:",
        error
      );

      // -------------------------------------------------
      // 401
      // -------------------------------------------------

      if (
        error.response?.status === 401
      ) {
        alert(
          "Authentication failed.\n\n" +
            "Your login session may have expired. " +
            "Please login again."
        );

        return;
      }

      // -------------------------------------------------
      // 403
      // -------------------------------------------------

      if (
        error.response?.status === 403
      ) {
        alert(
          error.response?.data?.message ||
            "You are not authorized to create a manager."
        );

        return;
      }

      // -------------------------------------------------
      // OTHER ERRORS
      // -------------------------------------------------

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create manager.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="add-manager-container">

      <div className="add-manager-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="add-manager-header">

          <div className="manager-header-icon">
            👤
          </div>

          <div>
            <h2>
              Add Manager
            </h2>

            <p className="add-manager-subtitle">
              Create a new manager account
            </p>
          </div>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}

          <div className="form-group">

            <label htmlFor="fullname">
              Full Name
              <span>*</span>
            </label>

            <input
              id="fullname"
              type="text"
              name="fullname"
              placeholder="Enter full name"
              value={manager.fullname}
              onChange={handleChange}
              autoComplete="name"
              required
            />

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Email
              <span>*</span>
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={manager.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

          </div>

          {/* PHONE */}

          <div className="form-group">

            <label htmlFor="phone">
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={manager.phone}
              onChange={handleChange}
              autoComplete="tel"
            />

          </div>

          {/* COMPANY */}

          <div className="form-group">

            <label htmlFor="company">
              Company
            </label>

            <input
              id="company"
              type="text"
              name="company"
              placeholder="Enter company name"
              value={manager.company}
              onChange={handleChange}
              autoComplete="organization"
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="password">
              Password
              <span>*</span>
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={manager.password}
              onChange={handleChange}
              minLength={6}
              autoComplete="new-password"
              required
            />

            <small>
              Password must contain at least
              6 characters.
            </small>

          </div>

          {/* ROLE */}

          <div className="form-group">

            <label>
              Account Role
            </label>

            <input
              type="text"
              value="Manager"
              readOnly
              className="readonly-role"
            />

            <small>
              This account will be created
              with the manager role.
            </small>

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="create-btn"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="button-spinner"></span>
                Creating Manager...
              </>
            ) : (
              "Create Manager"
            )}

          </button>

        </form>

      </div>

    </div>
  );
}

export default AddManager;