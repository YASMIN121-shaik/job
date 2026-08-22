import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaGraduationCap,
  FaTools,
  FaFileAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
} from "react-icons/fa";

import "./JobHolderCreateJob.css";

const API_URL = "http://localhost:5000";

function JobHolderCreateJob() {
  const navigate = useNavigate();

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    salary: "",
    experience: "",
    jobType: "Full Time",
    category: "",
    skills: "",
    description: "",
    lastDate: "",
    status: "Open",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getAuthToken = () => {
    const possibleKeys = [
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "userToken",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (value && value.trim()) {
        return value.trim();
      }
    }

    return null;
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    if (!formData.jobTitle.trim()) {
      return "Please enter the job title.";
    }

    if (!formData.companyName.trim()) {
      return "Please enter the company name.";
    }

    if (!formData.location.trim()) {
      return "Please enter the job location.";
    }

    if (!formData.category.trim()) {
      return "Please select a job category.";
    }

    if (!formData.description.trim()) {
      return "Please enter the job description.";
    }

    if (!formData.lastDate) {
      return "Please select the application last date.";
    }

    // Check deadline
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${formData.lastDate}T00:00:00`);

    if (selectedDate < today) {
      return "Application last date cannot be in the past.";
    }

    return null;
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      companyName: "",
      location: "",
      salary: "",
      experience: "",
      jobType: "Full Time",
      category: "",
      skills: "",
      description: "",
      lastDate: "",
      status: "Open",
    });
  };

  // =====================================================
  // SUBMIT JOB
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    // -----------------------------------------------------
    // GET TOKEN
    // -----------------------------------------------------

    const token = getAuthToken();

    console.log("AUTH TOKEN EXISTS:", !!token);

    if (!token) {
      setError(
        "Authentication token is required. Please login again."
      );

      return;
    }

    try {
      setLoading(true);

      // ===================================================
      // BACKEND PAYLOAD
      // ===================================================

      const jobPayload = {
        title: formData.jobTitle.trim(),

        company: formData.companyName.trim(),

        location: formData.location.trim(),

        salary: formData.salary.trim(),

        experience: formData.experience.trim(),

        job_type: formData.jobType,

        category: formData.category,

        skills: formData.skills.trim(),

        description: formData.description.trim(),

        last_date: formData.lastDate,

        status: "Open",
      };

      console.log(
        "CREATING JOB WITH PAYLOAD:",
        jobPayload
      );

      // ===================================================
      // CREATE JOB
      // ===================================================

      const response = await axios.post(
        `${API_URL}/api/jobs`,
        jobPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "JOB CREATED SUCCESSFULLY:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Job created successfully! It has been submitted for approval."
      );

      // -----------------------------------------------------
      // RESET FORM
      // -----------------------------------------------------

      resetForm();

      // -----------------------------------------------------
      // REDIRECT
      // -----------------------------------------------------

      setTimeout(() => {
        navigate("/jobholder/jobs");
      }, 1500);

    } catch (err) {
      console.error(
        "CREATE JOB ERROR:",
        err
      );

      // ===================================================
      // TOKEN EXPIRED / INVALID
      // ===================================================

      if (err.response?.status === 401) {
        const serverMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "";

        if (
          serverMessage
            .toLowerCase()
            .includes("token")
        ) {
          setError(
            "Your login session has expired. Please login again."
          );
        } else {
          setError(
            serverMessage ||
              "Authentication failed. Please login again."
          );
        }

        return;
      }

      // ===================================================
      // FORBIDDEN
      // ===================================================

      if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "You do not have permission to create jobs."
        );

        return;
      }

      // ===================================================
      // VALIDATION / SERVER ERROR
      // ===================================================

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to create job. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate("/jobholder");
  };

  // =====================================================
  // TODAY
  // =====================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="jobholder-create-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="jh-create-header">

        <div className="jh-create-title">

          <button
            type="button"
            className="jh-back-btn"
            onClick={handleBack}
            disabled={loading}
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>Create New Job</h1>

            <p>
              Create a job posting and find the right
              candidates.
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {success && (
        <div className="jh-alert jh-success-alert">
          <span>
            <FaCheckCircle />
          </span>

          {success}
        </div>
      )}

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="jh-alert jh-error-alert">
          <span>!</span>

          {error}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="jh-create-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            JOB INFORMATION
        ================================================= */}

        <div className="jh-form-card">

          <div className="jh-form-card-header">

            <div className="jh-section-icon">
              <FaBriefcase />
            </div>

            <div>
              <h2>Job Information</h2>

              <p>
                Enter the basic information about the
                position.
              </p>
            </div>

          </div>

          <div className="jh-form-grid">

            {/* JOB TITLE */}

            <div className="jh-form-group full-width">

              <label>
                Job Title <span>*</span>
              </label>

              <div className="jh-input-wrapper">

                <FaBriefcase />

                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Software Developer"
                  disabled={loading}
                />

              </div>

            </div>

            {/* COMPANY */}

            <div className="jh-form-group">

              <label>
                Company Name <span>*</span>
              </label>

              <div className="jh-input-wrapper">

                <FaBuilding />

                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  disabled={loading}
                />

              </div>

            </div>

            {/* LOCATION */}

            <div className="jh-form-group">

              <label>
                Location <span>*</span>
              </label>

              <div className="jh-input-wrapper">

                <FaMapMarkerAlt />

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                  disabled={loading}
                />

              </div>

            </div>

            {/* SALARY */}

            <div className="jh-form-group">

              <label>
                Salary
              </label>

              <div className="jh-input-wrapper">

                <FaMoneyBillWave />

                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. ₹4 - ₹6 LPA"
                  disabled={loading}
                />

              </div>

            </div>

            {/* EXPERIENCE */}

            <div className="jh-form-group">

              <label>
                Experience
              </label>

              <div className="jh-input-wrapper">

                <FaClock />

                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 0-2 years"
                  disabled={loading}
                />

              </div>

            </div>

            {/* JOB TYPE */}

            <div className="jh-form-group">

              <label>
                Job Type <span>*</span>
              </label>

              <div className="jh-input-wrapper">

                <FaBriefcase />

                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="Full Time">
                    Full Time
                  </option>

                  <option value="Part Time">
                    Part Time
                  </option>

                  <option value="Contract">
                    Contract
                  </option>

                  <option value="Internship">
                    Internship
                  </option>

                  <option value="Temporary">
                    Temporary
                  </option>

                </select>

              </div>

            </div>

            {/* CATEGORY */}

            <div className="jh-form-group">

              <label>
                Category <span>*</span>
              </label>

              <div className="jh-input-wrapper">

                <FaGraduationCap />

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="">
                    Select Category
                  </option>

                  <option value="IT & Software">
                    IT & Software
                  </option>

                  <option value="Finance">
                    Finance
                  </option>

                  <option value="Marketing">
                    Marketing
                  </option>

                  <option value="Human Resources">
                    Human Resources
                  </option>

                  <option value="Sales">
                    Sales
                  </option>

                  <option value="Healthcare">
                    Healthcare
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Engineering">
                    Engineering
                  </option>

                  <option value="Customer Service">
                    Customer Service
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>

            {/* SKILLS */}

            <div className="jh-form-group full-width">

              <label>
                Required Skills
              </label>

              <div className="jh-input-wrapper">

                <FaTools />

                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  disabled={loading}
                />

              </div>

              <small>
                Separate multiple skills with commas.
              </small>

            </div>

          </div>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="jh-form-card">

          <div className="jh-form-card-header">

            <div className="jh-section-icon">
              <FaFileAlt />
            </div>

            <div>
              <h2>Job Description</h2>

              <p>
                Provide details about the role and
                responsibilities.
              </p>
            </div>

          </div>

          <div className="jh-form-group">

            <label>
              Description <span>*</span>
            </label>

            <div className="jh-textarea-wrapper">

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job responsibilities, requirements and expectations..."
                rows="7"
                disabled={loading}
              />

            </div>

          </div>

        </div>

        {/* =================================================
            APPLICATION DETAILS
        ================================================= */}

        <div className="jh-form-card">

          <div className="jh-form-card-header">

            <div className="jh-section-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h2>Application Details</h2>

              <p>
                Set the deadline for candidates to apply.
              </p>
            </div>

          </div>

          <div className="jh-form-grid">

            {/* LAST DATE */}

            <div className="jh-form-group">

              <label>
                Application Last Date <span>*</span>
              </label>

              <div className="jh-input-wrapper">

                <FaCalendarAlt />

                <input
                  type="date"
                  name="lastDate"
                  value={formData.lastDate}
                  onChange={handleChange}
                  min={today}
                  disabled={loading}
                />

              </div>

            </div>

            {/* STATUS */}

            <div className="jh-form-group">

              <label>
                Job Status
              </label>

              <div className="jh-input-wrapper">

                <FaCheckCircle />

                <input
                  type="text"
                  value="Open"
                  disabled
                  readOnly
                />

              </div>

              <small>
                New jobs are created with Open status.
              </small>

            </div>

          </div>

        </div>

        {/* =================================================
            FORM ACTIONS
        ================================================= */}

        <div className="jh-form-actions">

          <button
            type="button"
            className="jh-cancel-btn"
            onClick={handleBack}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="jh-submit-btn"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="jh-spinner"></span>
                Creating Job...
              </>
            ) : (
              <>
                <FaSave />
                Create Job
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
}

export default JobHolderCreateJob;