import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFileAlt,
  FaRedo,
  FaExclamationCircle,
} from "react-icons/fa";

import "./JobHolderApplicants.css";

const API_URL = "http://localhost:5000";

function JobHolderApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* =====================================================
     GET AUTH TOKEN
  ===================================================== */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  /* =====================================================
     FETCH APPLICANTS
  ===================================================== */

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      console.log("Job Holder token exists:", !!token);

      if (!token) {
        setError(
          "Authentication token is missing. Please login again."
        );

        setApplicants([]);
        setFilteredApplicants([]);

        return;
      }

      /*
       * IMPORTANT:
       * Job Holder applicants endpoint.
       *
       * If your backend route is different, change only
       * this URL.
       */
      const response = await axios.get(
        `${API_URL}/api/jobholder/applicants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "JOB HOLDER APPLICANTS RESPONSE:",
        response.data
      );

      /*
       * Support different backend response formats.
       */

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (
        Array.isArray(response.data?.applicants)
      ) {
        data = response.data.applicants;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        data = response.data.data;
      }

      setApplicants(data);
      setFilteredApplicants(data);
    } catch (err) {
      console.error(
        "JOB HOLDER APPLICANTS ERROR:",
        err
      );

      /*
       * Authentication error
       */

      if (err.response?.status === 401) {
        setError(
          "Authentication expired. Please login again."
        );

        /*
         * Optional:
         * Remove invalid token.
         */
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("accessToken");

        setApplicants([]);
        setFilteredApplicants([]);

        return;
      }

      /*
       * Forbidden
       */

      if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "You are not authorized to view applicants."
        );

        return;
      }

      /*
       * Other backend errors
       */

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load applicants."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchApplicants();
  }, []);

  /* =====================================================
     FILTER APPLICANTS
  ===================================================== */

  useEffect(() => {
    let result = [...applicants];

    const value = search.trim().toLowerCase();

    if (value) {
      result = result.filter((applicant) => {
        const applicantName =
          applicant.applicant_name ||
          applicant.applicantName ||
          applicant.candidate_name ||
          applicant.candidateName ||
          applicant.fullname ||
          applicant.name ||
          "";

        const email =
          applicant.email ||
          applicant.applicant_email ||
          applicant.candidate_email ||
          "";

        const jobTitle =
          applicant.jobTitle ||
          applicant.job_title ||
          applicant.title ||
          applicant.job_name ||
          "";

        return (
          String(applicantName)
            .toLowerCase()
            .includes(value) ||
          String(email)
            .toLowerCase()
            .includes(value) ||
          String(jobTitle)
            .toLowerCase()
            .includes(value)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter((applicant) => {
        const status = String(
          applicant.status || "Pending"
        ).toLowerCase();

        return (
          status ===
          statusFilter.toLowerCase()
        );
      });
    }

    setFilteredApplicants(result);
  }, [search, statusFilter, applicants]);

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (
      value === "accepted" ||
      value === "selected" ||
      value === "approved"
    ) {
      return "jha-status-success";
    }

    if (
      value === "rejected" ||
      value === "declined"
    ) {
      return "jha-status-danger";
    }

    if (
      value === "shortlisted" ||
      value === "interview"
    ) {
      return "jha-status-info";
    }

    return "jha-status-pending";
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     VIEW RESUME
  ===================================================== */

  const handleViewResume = (applicant) => {
    const resume =
      applicant.resume ||
      applicant.resume_url ||
      applicant.resumeUrl ||
      applicant.resume_path ||
      applicant.resumePath;

    if (!resume) {
      alert("Resume is not available.");
      return;
    }

    /*
     * If backend returns a relative path such as:
     * /uploads/resumes/file.pdf
     *
     * convert it into a full URL.
     */

    const resumeUrl = String(resume).startsWith("http")
      ? resume
      : `${API_URL}${
          String(resume).startsWith("/")
            ? ""
            : "/"
        }${resume}`;

    window.open(resumeUrl, "_blank");
  };

  /* =====================================================
     RELOAD
  ===================================================== */

  const handleRetry = () => {
    fetchApplicants();
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="jha-page">
        <div className="jha-loading">
          <div className="jha-spinner"></div>

          <p>
            Loading applicants...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="jha-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="jha-header">

        <div className="jha-heading">

          <div className="jha-heading-icon">
            <FaUsers />
          </div>

          <div>
            <h1>Applicants</h1>

            <p>
              Review and manage candidates who
              applied for your jobs.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="jha-refresh-btn"
          onClick={handleRetry}
          disabled={loading}
        >
          <FaRedo />
          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="jha-error">

          <div className="jha-error-content">

            <FaExclamationCircle />

            <span>
              {error}
            </span>

          </div>

          <button
            type="button"
            onClick={handleRetry}
          >
            <FaRedo />
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="jha-stats">

        {/* TOTAL */}

        <div className="jha-stat-card">

          <div className="jha-stat-icon total">
            <FaUsers />
          </div>

          <div>
            <span>Total Applicants</span>

            <strong>
              {applicants.length}
            </strong>
          </div>

        </div>

        {/* PENDING */}

        <div className="jha-stat-card">

          <div className="jha-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Pending</span>

            <strong>
              {
                applicants.filter(
                  (item) =>
                    String(
                      item.status || "Pending"
                    ).toLowerCase() ===
                    "pending"
                ).length
              }
            </strong>
          </div>

        </div>

        {/* SHORTLISTED */}

        <div className="jha-stat-card">

          <div className="jha-stat-icon shortlisted">
            <FaCheckCircle />
          </div>

          <div>
            <span>Shortlisted</span>

            <strong>
              {
                applicants.filter(
                  (item) =>
                    String(
                      item.status || ""
                    ).toLowerCase() ===
                    "shortlisted"
                ).length
              }
            </strong>
          </div>

        </div>

        {/* REJECTED */}

        <div className="jha-stat-card">

          <div className="jha-stat-icon rejected">
            <FaTimesCircle />
          </div>

          <div>
            <span>Rejected</span>

            <strong>
              {
                applicants.filter(
                  (item) =>
                    String(
                      item.status || ""
                    ).toLowerCase() ===
                    "rejected"
                ).length
              }
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="jha-filter-bar">

        <div className="jha-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search applicant, email or job..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="jha-status-filter">

          <FaFilter />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Shortlisted">
              Shortlisted
            </option>

            <option value="Interview">
              Interview
            </option>

            <option value="Selected">
              Selected
            </option>

            <option value="Rejected">
              Rejected
            </option>

          </select>

        </div>

      </div>

      {/* =================================================
          RESULTS
      ================================================= */}

      <div className="jha-results">

        Showing{" "}

        <strong>
          {filteredApplicants.length}
        </strong>{" "}

        applicants

      </div>

      {/* =================================================
          EMPTY
      ================================================= */}

      {filteredApplicants.length === 0 ? (

        <div className="jha-empty">

          <div className="jha-empty-icon">
            <FaUsers />
          </div>

          <h2>
            {error
              ? "Unable to Load Applicants"
              : "No Applicants Found"}
          </h2>

          <p>
            {error
              ? "There was a problem loading your applicants."
              : "There are currently no applicants matching your search or filter."}
          </p>

          {error && (
            <button
              type="button"
              className="jha-empty-retry"
              onClick={handleRetry}
            >
              <FaRedo />
              Try Again
            </button>
          )}

        </div>

      ) : (

        /* =================================================
           APPLICANTS TABLE
        ================================================= */

        <div className="jha-table-container">

          <table className="jha-table">

            <thead>

              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Contact</th>
                <th>Experience</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredApplicants.map(
                (applicant, index) => {

                  const applicantName =
                    applicant.applicant_name ||
                    applicant.applicantName ||
                    applicant.candidate_name ||
                    applicant.candidateName ||
                    applicant.fullname ||
                    applicant.name ||
                    "Unknown Applicant";

                  const email =
                    applicant.email ||
                    applicant.applicant_email ||
                    applicant.candidate_email ||
                    "No email";

                  const phone =
                    applicant.phone ||
                    applicant.applicant_phone ||
                    applicant.candidate_phone ||
                    "No phone";

                  const jobTitle =
                    applicant.jobTitle ||
                    applicant.job_title ||
                    applicant.title ||
                    applicant.job_name ||
                    "Job";

                  const experience =
                    applicant.experience ||
                    applicant.experience_level ||
                    "Not specified";

                  const status =
                    applicant.status ||
                    "Pending";

                  return (
                    <tr
                      key={
                        applicant.id ||
                        applicant.application_id ||
                        index
                      }
                    >

                      {/* APPLICANT */}

                      <td>

                        <div className="jha-applicant">

                          <div className="jha-avatar">
                            {String(
                              applicantName
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {applicantName}
                            </strong>

                            <span>
                              Candidate
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* JOB */}

                      <td>

                        <div className="jha-job">

                          <FaBriefcase />

                          <span>
                            {jobTitle}
                          </span>

                        </div>

                      </td>

                      {/* CONTACT */}

                      <td>

                        <div className="jha-contact">

                          <span>
                            <FaEnvelope />
                            {email}
                          </span>

                          <span>
                            <FaPhone />
                            {phone}
                          </span>

                        </div>

                      </td>

                      {/* EXPERIENCE */}

                      <td>

                        <span className="jha-experience">
                          {experience}
                        </span>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="jha-date">

                          <FaCalendarAlt />

                          <span>
                            {formatDate(
                              applicant.applied_at ||
                              applicant.appliedAt ||
                              applicant.created_at ||
                              applicant.createdAt
                            )}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`jha-status ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          type="button"
                          className="jha-view-btn"
                          onClick={() =>
                            handleViewResume(
                              applicant
                            )
                          }
                          title="View Resume"
                        >
                          <FaFileAlt />
                          Resume
                        </button>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default JobHolderApplicants;