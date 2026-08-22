import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMapPin,
  FiBriefcase,
  FiFileText,
  FiSearch,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";

import "./TotalJobs.css";

function TotalJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/jobs";
  const SERVER_URL = "http://localhost:5000";

  /* =====================================================
     FETCH ALL JOBS
  ===================================================== */

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        setError(
          data.message || "Failed to load jobs"
        );
      }
    } catch (err) {
      console.error("Fetch Jobs Error:", err);

      setError(
        "Unable to connect to the backend. Make sure your server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD JOBS
  ===================================================== */

  useEffect(() => {
    fetchJobs();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    if (!search) {
      return true;
    }

    return (
      (job.title || "")
        .toLowerCase()
        .includes(search) ||

      (job.company || "")
        .toLowerCase()
        .includes(search) ||

      (job.location || "")
        .toLowerCase()
        .includes(search) ||

      (job.job_type || "")
        .toLowerCase()
        .includes(search) ||

      (job.category || "")
        .toLowerCase()
        .includes(search) ||

      (job.department || "")
        .toLowerCase()
        .includes(search)
    );
  });

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalJobs = jobs.length;

  const openJobs = jobs.filter(
    (job) =>
      (job.status || "")
        .toLowerCase() === "open"
  ).length;

  const closedJobs = jobs.filter(
    (job) =>
      (job.status || "")
        .toLowerCase() === "closed"
  ).length;

  const companiesHiring = new Set(
    jobs
      .filter(
        (job) =>
          (job.status || "")
            .toLowerCase() === "open"
      )
      .map((job) => job.company)
      .filter(Boolean)
  ).size;

  /* =====================================================
     EDIT JOB
  ===================================================== */

  const handleEdit = (job) => {
    if (!job || !job.id) {
      alert("Unable to edit this job because the job ID is missing.");
      return;
    }

    navigate(`/edit-job/${job.id}`);
  };

  /* =====================================================
     DELETE JOB
  ===================================================== */

  const handleDelete = async (job) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${job.title}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${job.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete job"
        );
      }

      setJobs((previousJobs) =>
        previousJobs.filter(
          (item) => item.id !== job.id
        )
      );

      alert("Job deleted successfully.");

    } catch (err) {
      console.error(
        "Delete Job Error:",
        err
      );

      alert(
        "Unable to delete job. Please check your backend connection."
      );
    }
  };

  /* =====================================================
     CREATE JOB
  ===================================================== */

  const handleCreateJob = () => {
    navigate("/create-job");
  };

  /* =====================================================
     VIEW PDF
  ===================================================== */

  const getPdfUrl = (job) => {
    if (!job.description_file) {
      return null;
    }

    if (
      job.description_file.startsWith(
        "http://"
      ) ||
      job.description_file.startsWith(
        "https://"
      )
    ) {
      return job.description_file;
    }

    return `${SERVER_URL}${job.description_file}`;
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date not specified";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="total-jobs-page">

        <div className="jobs-loading">

          <div className="loading-spinner"></div>

          <h3>
            Loading Jobs...
          </h3>

          <p>
            Please wait while we fetch jobs
            from the server.
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="total-jobs-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="jobs-page-header">

        <div className="page-title-area">

          <div className="page-title-icon">
            <FiBriefcase />
          </div>

          <div>
            <h1>
              Total Jobs
            </h1>

            <p>
              Manage all job postings in one place.
            </p>
          </div>

        </div>

        <div className="header-actions">

          <button
            className="refresh-btn"
            onClick={fetchJobs}
            title="Refresh jobs"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            className="add-job-btn"
            onClick={handleCreateJob}
          >
            <FiPlus />
            Create Job
          </button>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="jobs-error">

          <div>

            <strong>
              Connection Error
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            onClick={fetchJobs}
          >
            Try Again
          </button>

        </div>
      )}


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="jobs-toolbar">

        <div className="search-wrapper">

          <FiSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search by job title, company, location..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

          {searchTerm && (
            <button
              className="clear-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              ×
            </button>
          )}

        </div>

        <div className="job-result-count">

          Showing{" "}

          <strong>
            {filteredJobs.length}
          </strong>{" "}

          of{" "}

          <strong>
            {totalJobs}
          </strong>{" "}

          jobs

        </div>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="job-stats">

        {/* TOTAL */}

        <div className="stat-card total-card">

          <div className="stat-icon">
            T
          </div>

          <div className="stat-info">

            <span className="stat-number">
              {totalJobs}
            </span>

            <span className="stat-label">
              Total Jobs
            </span>

          </div>

        </div>


        {/* OPEN */}

        <div className="stat-card open-card">

          <div className="stat-icon">
            O
          </div>

          <div className="stat-info">

            <span className="stat-number">
              {openJobs}
            </span>

            <span className="stat-label">
              Open Jobs
            </span>

          </div>

        </div>


        {/* CLOSED */}

        <div className="stat-card closed-card">

          <div className="stat-icon">
            C
          </div>

          <div className="stat-info">

            <span className="stat-number">
              {closedJobs}
            </span>

            <span className="stat-label">
              Closed Jobs
            </span>

          </div>

        </div>


        {/* COMPANIES */}

        <div className="stat-card company-card">

          <div className="stat-icon">
            H
          </div>

          <div className="stat-info">

            <span className="stat-number">
              {companiesHiring}
            </span>

            <span className="stat-label">
              Companies Hiring
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          JOB LIST
      ================================================= */}

      <div className="jobs-section">

        <div className="section-heading">

          <div>

            <h2>
              All Job Postings
            </h2>

            <p>
              Jobs currently available in the system
            </p>

          </div>

        </div>


        {filteredJobs.length > 0 ? (

          <div className="total-job-grid">

            {filteredJobs.map((job) => {

              const pdfUrl =
                getPdfUrl(job);

              const status =
                job.status || "Open";

              const isOpen =
                status
                  .toLowerCase() ===
                "open";

              return (

                <div
                  className="total-job-card"
                  key={job.id}
                >

                  {/* ===================================
                      CARD TOP
                  =================================== */}

                  <div className="job-card-top">

                    <div className="job-company-icon">
                      <FiBriefcase />
                    </div>

                    <div className="job-card-title">

                      <h2>
                        {job.title ||
                          "Untitled Job"}
                      </h2>

                      <p>
                        {job.company ||
                          "Company not specified"}
                      </p>

                    </div>

                    <span
                      className={`total-job-status ${
                        isOpen
                          ? "status-open"
                          : "status-closed"
                      }`}
                    >

                      <span className="status-dot"></span>

                      {status}

                    </span>

                  </div>


                  {/* ===================================
                      JOB INFORMATION
                  =================================== */}

                  <div className="job-info-row">

                    <div className="job-info-item">

                      <FiMapPin />

                      <span>
                        {job.location ||
                          "Location not specified"}
                      </span>

                    </div>


                    <div className="job-info-item">

                      <FiBriefcase />

                      <span>
                        {job.job_type ||
                          "Job type not specified"}
                      </span>

                    </div>

                  </div>


                  {/* ===================================
                      CATEGORY
                  =================================== */}

                  {(job.category ||
                    job.department) && (

                    <div className="job-tags">

                      {job.category && (
                        <span className="job-tag">
                          {job.category}
                        </span>
                      )}

                      {job.department && (
                        <span className="job-tag">
                          {job.department}
                        </span>
                      )}

                    </div>

                  )}


                  {/* ===================================
                      DESCRIPTION
                  =================================== */}

                  <div className="job-description">

                    <h4>
                      Job Description
                    </h4>

                    <p>
                      {job.description ||
                        "No job description available."}
                    </p>

                  </div>


                  {/* ===================================
                      SKILLS
                  =================================== */}

                  {job.skills && (

                    <div className="job-skills">

                      <h4>
                        Skills
                      </h4>

                      <div className="skills-list">

                        {String(job.skills)
                          .split(",")
                          .slice(0, 5)
                          .map(
                            (skill, index) => (
                              <span
                                key={index}
                                className="skill-tag"
                              >
                                {skill.trim()}
                              </span>
                            )
                          )}

                      </div>

                    </div>

                  )}


                  {/* ===================================
                      BOTTOM
                  =================================== */}

                  <div className="total-job-bottom">

                    <div className="job-bottom-details">

                      {/* SALARY */}

                      <div className="salary-info">

                        <span className="detail-label">
                          Salary
                        </span>

                        <strong>
                          {job.salary ||
                            "Not specified"}
                        </strong>

                      </div>


                      {/* DATE */}

                      <div className="date-info">

                        <span className="detail-label">
                          Last Date
                        </span>

                        <strong>
                          {formatDate(
                            job.last_date
                          )}
                        </strong>

                      </div>

                    </div>


                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <div className="total-job-actions">

                      {/* VIEW PDF */}

                      {pdfUrl ? (

                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-pdf-btn"
                        >

                          <FiEye />

                          View PDF

                        </a>

                      ) : (

                        <span className="no-pdf">

                          <FiFileText />

                          No PDF

                        </span>

                      )}


                      {/* =================================
                          EDIT BUTTON
                      ================================= */}

                      <button
                        type="button"
                        className="total-job-edit"
                        onClick={() =>
                          handleEdit(job)
                        }
                        title="Edit Job"
                      >

                        <FiEdit />

                        Edit

                      </button>


                      {/* =================================
                          DELETE BUTTON
                      ================================= */}

                      <button
                        type="button"
                        className="total-job-delete"
                        onClick={() =>
                          handleDelete(job)
                        }
                        title="Delete Job"
                      >

                        <FiTrash2 />

                        Delete

                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        ) : (

          /* =============================================
             NO JOBS
          ============================================= */

          <div className="no-jobs">

            <div className="no-jobs-icon">
              <FiBriefcase />
            </div>

            <h3>

              {searchTerm
                ? "No jobs found"
                : "No jobs available"}

            </h3>

            <p>

              {searchTerm
                ? "Try searching with a different keyword."
                : "There are currently no job postings in the database."}

            </p>

            {searchTerm && (

              <button
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Clear Search
              </button>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default TotalJobs;