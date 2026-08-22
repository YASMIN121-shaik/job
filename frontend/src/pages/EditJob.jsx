import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiSave,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

import "./EditJob.css";

const API_URL = "http://localhost:5000/api/jobs";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    experience: "",
    job_type: "",
    category: "",
    department: "",
    education: "",
    vacancies: 1,
    skills: "",
    description: "",
    responsibilities: "",
    benefits: "",
    last_date: "",
    status: "Open",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token || token.trim() === "") {
      return null;
    }

    return token;
  };

  // =====================================================
  // FETCH JOB
  // =====================================================

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await fetch(`${API_URL}/${id}`);

        const data = await response.json();

        console.log("Get Job Response:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load job"
          );
        }

        const job = data.job;

        // =================================================
        // SET FORM DATA
        // =================================================

        setFormData({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          salary: job.salary || "",
          experience: job.experience || "",
          job_type: job.job_type || "",
          category: job.category || "",
          department: job.department || "",
          education: job.education || "",
          vacancies: job.vacancies || 1,
          skills: job.skills || "",
          description: job.description || "",
          responsibilities: job.responsibilities || "",
          benefits: job.benefits || "",
          last_date: job.last_date
            ? String(job.last_date).split("T")[0]
            : "",
          status: job.status || "Open",
        });
      } catch (err) {
        console.error("Fetch Job Error:", err);

        setError(
          err.message ||
            "Unable to load job details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Job title is required.");
      return false;
    }

    if (!formData.company.trim()) {
      setError("Company is required.");
      return false;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return false;
    }

    // Vacancies validation
    const vacancyCount = Number(formData.vacancies);

    if (
      !Number.isInteger(vacancyCount) ||
      vacancyCount < 1
    ) {
      setError(
        "Vacancies must be a valid positive number."
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // UPDATE JOB
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ===================================================
    // VALIDATE
    // ===================================================

    if (!validateForm()) {
      return;
    }

    // ===================================================
    // TOKEN
    // ===================================================

    const token = getToken();

    if (!token) {
      setError(
        "Authentication token is required. Please login again."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    // ===================================================
    // UPDATE
    // ===================================================

    try {
      setSaving(true);

      console.log("==============================");
      console.log("UPDATING JOB");
      console.log("JOB ID:", id);
      console.log("TOKEN FOUND:", !!token);
      console.log("FORM DATA:", formData);
      console.log("==============================");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: formData.title.trim(),

            company: formData.company.trim(),

            location: formData.location.trim(),

            salary:
              formData.salary.trim() || null,

            experience:
              formData.experience.trim() || null,

            job_type:
              formData.job_type || null,

            category:
              formData.category.trim() || null,

            department:
              formData.department.trim() || null,

            education:
              formData.education.trim() || null,

            vacancies:
              Number(formData.vacancies),

            skills:
              formData.skills.trim() || null,

            description:
              formData.description.trim() || null,

            responsibilities:
              formData.responsibilities.trim() ||
              null,

            benefits:
              formData.benefits.trim() || null,

            last_date:
              formData.last_date || null,

            status:
              formData.status || "Open",
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Update Job Response:",
        data
      );

      // =================================================
      // AUTH ERROR
      // =================================================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");

        setError(
          "Your session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      // =================================================
      // API ERROR
      // =================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update job"
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Job updated successfully."
      );

      // Navigate after success
      setTimeout(() => {
        navigate("/total-jobs");
      }, 1000);
    } catch (err) {
      console.error(
        "Update Job Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update job. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate("/total-jobs");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="edit-job-page">

        <div className="edit-job-loading">

          <div className="edit-loading-spinner"></div>

          <h3>
            Loading Job...
          </h3>

          <p>
            Please wait while we load the
            job details.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="edit-job-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="edit-job-header">

        <div className="edit-job-title">

          <button
            type="button"
            className="back-btn"
            onClick={handleCancel}
            disabled={saving}
            title="Back to Total Jobs"
          >
            <FiArrowLeft />
          </button>

          <div>

            <h1>
              Edit Job
            </h1>

            <p>
              Update the job posting details
              below.
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="edit-job-error">

          <div className="error-icon">
            !
          </div>

          <div>

            <strong>
              Error
            </strong>

            <span>
              {error}
            </span>

          </div>

        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="edit-job-success">

          <div className="success-icon">
            ✓
          </div>

          <span>
            {success}
          </span>

        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        className="edit-job-card"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            JOB INFORMATION
        ================================================= */}

        <div className="form-section">

          <div className="section-title">

            <div className="section-icon">
              <FiBriefcase />
            </div>

            <div>

              <h2>
                Job Information
              </h2>

              <p>
                Basic information about this
                position.
              </p>

            </div>

          </div>

          <div className="form-grid">

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="form-group full-width">

              <label>
                Job Title
                <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter job title"
                required
                disabled={saving}
              />

            </div>

            {/* =================================================
                COMPANY
            ================================================= */}

            <div className="form-group">

              <label>
                Company
                <span>*</span>
              </label>

              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
                required
                disabled={saving}
              />

            </div>

            {/* =================================================
                LOCATION
            ================================================= */}

            <div className="form-group">

              <label>
                Location
                <span>*</span>
              </label>

              <div className="input-with-icon">

                <FiMapPin />

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad"
                  required
                  disabled={saving}
                />

              </div>

            </div>

            {/* =================================================
                JOB TYPE
            ================================================= */}

            <div className="form-group">

              <label>
                Job Type
              </label>

              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                disabled={saving}
              >

                <option value="">
                  Select job type
                </option>

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

                <option value="Remote">
                  Remote
                </option>

              </select>

            </div>

            {/* =================================================
                CATEGORY
            ================================================= */}

            <div className="form-group">

              <label>
                Category
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. IT"
                disabled={saving}
              />

            </div>

            {/* =================================================
                DEPARTMENT
            ================================================= */}

            <div className="form-group">

              <label>
                Department
              </label>

              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
                disabled={saving}
              />

            </div>

            {/* =================================================
                SALARY
            ================================================= */}

            <div className="form-group">

              <label>
                Salary
              </label>

              <div className="input-with-icon">

                <FiDollarSign />

                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. ₹6,00,000"
                  disabled={saving}
                />

              </div>

            </div>

            {/* =================================================
                EXPERIENCE
            ================================================= */}

            <div className="form-group">

              <label>
                Experience
              </label>

              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 2-4 years"
                disabled={saving}
              />

            </div>

            {/* =================================================
                EDUCATION
            ================================================= */}

            <div className="form-group">

              <label>
                Education
              </label>

              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g. B.Tech / M.Tech"
                disabled={saving}
              />

            </div>

            {/* =================================================
                VACANCIES
            ================================================= */}

            <div className="form-group">

              <label>
                Vacancies
              </label>

              <input
                type="number"
                name="vacancies"
                min="1"
                value={formData.vacancies}
                onChange={handleChange}
                placeholder="Number of vacancies"
                disabled={saving}
              />

            </div>

            {/* =================================================
                LAST DATE
            ================================================= */}

            <div className="form-group">

              <label>
                Application Last Date
              </label>

              <div className="input-with-icon">

                <FiCalendar />

                <input
                  type="date"
                  name="last_date"
                  value={formData.last_date}
                  onChange={handleChange}
                  disabled={saving}
                />

              </div>

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={saving}
              >

                <option value="Open">
                  Open
                </option>

                <option value="Closed">
                  Closed
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* =================================================
            SKILLS
        ================================================= */}

        <div className="form-section">

          <div className="section-title">

            <div className="section-icon">
              <FiBriefcase />
            </div>

            <div>

              <h2>
                Skills
              </h2>

              <p>
                Add the skills required
                for this job.
              </p>

            </div>

          </div>

          <div className="form-group">

            <label>
              Skills
            </label>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, PostgreSQL"
              disabled={saving}
            />

            <small>
              Separate multiple skills
              with commas.
            </small>

          </div>

        </div>

    
      
        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="edit-job-footer">

          <button
            type="button"
            className="cancel-edit-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-job-btn"
            disabled={saving}
          >

            <FiSave />

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </form>

    </div>
  );
}

export default EditJob;