import React, { useEffect, useState } from "react";
import "./ApprovedJobs.css";

import {
  FaEye,
  FaTrash,
  FaSearch,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUserCheck,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaRedo,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

function ApprovedJobs() {
  // =====================================================
  // STATE
  // =====================================================

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getAuthHeaders = () => {
    const token = getToken();

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const value = new Date(date);

    if (isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FETCH APPROVED JOBS
  //
  // IMPORTANT:
  // This page shows JOBS.
  // It does NOT fetch applications.
  // =====================================================

  const fetchApprovedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      console.log(
        "Approved Jobs token exists:",
        !!token
      );

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      // -------------------------------------------------
      // GET ALL JOBS
      // -------------------------------------------------

      const response = await fetch(
        `${API_URL}/api/jobs`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          success: false,
          message:
            text ||
            "Server returned an invalid response.",
        };
      }

      console.log(
        "Jobs API Status:",
        response.status
      );

      console.log(
        "Jobs API Response:",
        data
      );

      // -------------------------------------------------
      // AUTH ERROR
      // -------------------------------------------------

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        throw new Error(
          data.message ||
            "Authentication failed. Please login again."
        );
      }

      // -------------------------------------------------
      // API ERROR
      // -------------------------------------------------

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to fetch jobs."
        );
      }

      // -------------------------------------------------
      // GET JOB ARRAY
      //
      // Supports:
      // data.jobs
      // data.data
      // direct array response
      // -------------------------------------------------

      let allJobs = [];

      if (Array.isArray(data)) {
        allJobs = data;
      } else if (Array.isArray(data.jobs)) {
        allJobs = data.jobs;
      } else if (Array.isArray(data.data)) {
        allJobs = data.data;
      }

      console.log(
        "All Jobs:",
        allJobs
      );

      // -------------------------------------------------
      // ONLY APPROVED JOBS
      //
      // Supports:
      // Approved
      // approved
      // APPROVED
      // " Approved "
      // -------------------------------------------------

      const approvedJobs = allJobs.filter(
        (job) => {
          const status = String(
            job.status || ""
          )
            .trim()
            .toLowerCase();

          return status === "approved";
        }
      );

      console.log(
        "Approved Jobs:",
        approvedJobs
      );

      console.log(
        "Approved Jobs Count:",
        approvedJobs.length
      );

      setJobs(approvedJobs);
    } catch (err) {
      console.error(
        "Fetch Approved Jobs Error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PAGE
  // =====================================================

  useEffect(() => {
    fetchApprovedJobs();
  }, []);

  // =====================================================
  // DELETE JOB
  // =====================================================

  const deleteJob = async (job) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the approved job "${job.title ||
        "this job"}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert(
          "Authentication token is missing. Please login again."
        );
        return;
      }

      setDeletingId(job.id);

      console.log(
        "Deleting approved job:",
        job.id
      );

      const response = await fetch(
        `${API_URL}/api/jobs/${job.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          success: false,
          message:
            text ||
            "Invalid server response.",
        };
      }

      console.log(
        "Delete Job Response:",
        data
      );

      // -------------------------------------------------
      // AUTH ERROR
      // -------------------------------------------------

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        throw new Error(
          data.message ||
            "Authentication failed. Please login again."
        );
      }

      // -------------------------------------------------
      // API ERROR
      // -------------------------------------------------

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete job."
        );
      }

      // -------------------------------------------------
      // REMOVE FROM UI
      // -------------------------------------------------

      setJobs((previous) =>
        previous.filter(
          (item) => item.id !== job.id
        )
      );

      alert(
        "Approved job deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete Approved Job Error:",
        err
      );

      alert(
        err.message ||
          "Failed to delete job."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // VIEW JOB
  // =====================================================

  const viewJob = (job) => {
    alert(
      `Job: ${job.title || "—"}\n` +
        `Company: ${job.company || "—"}\n` +
        `Location: ${job.location || "—"}\n` +
        `Salary: ${job.salary || "—"}\n` +
        `Job Type: ${job.job_type || "—"}\n` +
        `Experience: ${job.experience || "—"}\n` +
        `Status: ${job.status || "Approved"}\n` +
        `Posted Date: ${formatDate(
          job.created_at ||
            job.posted_at ||
            job.created_date
        )}`
    );
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredJobs = jobs.filter(
    (job) => {
      const text = search
        .toLowerCase()
        .trim();

      if (!text) {
        return true;
      }

      return (
        String(job.title || "")
          .toLowerCase()
          .includes(text) ||

        String(job.company || "")
          .toLowerCase()
          .includes(text) ||

        String(job.location || "")
          .toLowerCase()
          .includes(text) ||

        String(job.job_type || "")
          .toLowerCase()
          .includes(text) ||

        String(job.experience || "")
          .toLowerCase()
          .includes(text) ||

        String(job.salary || "")
          .toLowerCase()
          .includes(text)
      );
    }
  );

  // =====================================================
  // JOB INITIAL
  // =====================================================

  const getJobInitial = (title) => {
    if (!title) {
      return "J";
    }

    return title
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  // =====================================================
  // LOGIN AGAIN
  // =====================================================

  const loginAgain = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");

    window.location.href = "/login";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="approved-jobs-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="approved-header">

        <div className="approved-header-content">

          <div className="approved-header-icon">
            <FaBriefcase />
          </div>

          <div>
            <h2>
              Approved Jobs
            </h2>

            <p>
              View and manage jobs that
              have been approved.
            </p>
          </div>

        </div>

        {/* SEARCH */}

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search approved jobs..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-row">

        <div className="stat-card">

          <div className="stat-icon approved-stat">
            <FaUserCheck />
          </div>

          <div>
            <h3>
              {jobs.length}
            </h3>

            <p>
              Total Approved Jobs
            </p>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon showing-stat">
            <FaBriefcase />
          </div>

          <div>
            <h3>
              {filteredJobs.length}
            </h3>

            <p>
              Showing Jobs
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          TABLE CARD
      ================================================= */}

      <div className="table-card">

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="loading-container">

            <div className="loading-spinner">
              <FaRedo />
            </div>

            <p>
              Loading approved jobs...
            </p>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="error-message">

            <div className="error-icon">
              <FaExclamationCircle />
            </div>

            <h3>
              Backend Connection Error
            </h3>

            <p>
              {error}
            </p>

            <div className="error-actions">

              <button
                type="button"
                onClick={
                  fetchApprovedJobs
                }
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={loginAgain}
              >
                Login Again
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        {!loading && !error && (
          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Job
                  </th>

                  <th>
                    Company
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Salary
                  </th>

                  <th>
                    Job Type
                  </th>

                  <th>
                    Posted Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {/* =================================================
                    EMPTY
                ================================================= */}

                {filteredJobs.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="empty-state"
                    >

                      <div>

                        <div className="empty-icon">
                          <FaBriefcase />
                        </div>

                        <h3>
                          No approved jobs found
                        </h3>

                        <p>
                          Approved jobs will
                          appear here.
                        </p>

                        {search && (
                          <button
                            type="button"
                            onClick={() =>
                              setSearch("")
                            }
                          >
                            Clear Search
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ) : (

                  /* =================================================
                     APPROVED JOB LIST
                  ================================================= */

                  filteredJobs.map(
                    (job) => (

                      <tr
                        key={job.id}
                      >

                        {/* =================================================
                            JOB
                        ================================================= */}

                        <td>

                          <div className="job-title-cell">

                            <div
                              className="job-avatar"
                            >
                              {getJobInitial(
                                job.title
                              )}
                            </div>

                            <div>

                              <strong>
                                {job.title ||
                                  "Unknown Job"}
                              </strong>

                              <span>
                                Job #
                                {job.id}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* =================================================
                            COMPANY
                        ================================================= */}

                        <td>

                          <div className="company-cell">

                            <FaBuilding />

                            <span>
                              {job.company ||
                                "Unknown Company"}
                            </span>

                          </div>

                        </td>

                        {/* =================================================
                            LOCATION
                        ================================================= */}

                        <td>

                          <div className="location-cell">

                            <FaMapMarkerAlt />

                            <span>
                              {job.location ||
                                "Not specified"}
                            </span>

                          </div>

                        </td>

                        {/* =================================================
                            SALARY
                        ================================================= */}

                        <td>

                          <div className="salary-cell">

                            <FaMoneyBillWave />

                            <span>
                              {job.salary ||
                                "Not specified"}
                            </span>

                          </div>

                        </td>

                        {/* =================================================
                            JOB TYPE
                        ================================================= */}

                        <td>

                          <div className="job-type-cell">

                            <FaBriefcase />

                            <span>
                              {job.job_type ||
                                "Not specified"}
                            </span>

                          </div>

                        </td>

                        {/* =================================================
                            POSTED DATE
                        ================================================= */}

                        <td>

                          <div className="date-cell">

                            <FaCalendarAlt />

                            <span>
                              {formatDate(
                                job.created_at ||
                                  job.posted_at ||
                                  job.created_date
                              )}
                            </span>

                          </div>

                        </td>

                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <td>

                          <span className="status approved">

                            <FaUserCheck />

                            Approved

                          </span>

                        </td>

                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <td>

                          <div className="action-buttons">

                            {/* VIEW */}

                            <button
                              type="button"
                              className="view-btn"
                              title="View Job"
                              onClick={() =>
                                viewJob(job)
                              }
                            >
                              <FaEye />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              className="delete-btn"
                              title="Delete Job"
                              disabled={
                                deletingId ===
                                job.id
                              }
                              onClick={() =>
                                deleteJob(job)
                              }
                            >

                              {deletingId ===
                              job.id ? (
                                <span>
                                  ...
                                </span>
                              ) : (
                                <FaTrash />
                              )}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default ApprovedJobs;