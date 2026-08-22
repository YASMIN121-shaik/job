import React, { useEffect, useState } from "react";
import "./Applicants.css";

import {
  FaUsers,
  FaSearch,
  FaSyncAlt,
  FaCheck,
  FaTimes,
  FaTrash,
  FaFileAlt,
  FaExclamationCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaBriefcase,
  FaBuilding,
  FaRedo,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

function Applicants() {
  // =====================================================
  // STATE
  // =====================================================

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getAuthToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  /*
    Your backend may return:
      Accepted
      accepted
      Approved
      approved

    We treat Accepted and Approved as the same
    "approved applicant" status in the frontend.
  */

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (
      value === "accepted" ||
      value === "approved"
    ) {
      return "approved";
    }

    if (value === "rejected") {
      return "rejected";
    }

    if (value === "shortlisted") {
      return "shortlisted";
    }

    if (value === "interview") {
      return "interview";
    }

    return "pending";
  };

  // =====================================================
  // IS APPROVED
  // =====================================================

  const isApprovedApplication = (application) => {
    return (
      normalizeStatus(application?.status) ===
      "approved"
    );
  };

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      console.log(
        "Applicants token exists:",
        !!token
      );

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/jobs/applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
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
        "Applications API Status:",
        response.status
      );

      console.log(
        "Applications API Response:",
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
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        throw new Error(
          data.message ||
            "Authentication failed. Please login again."
        );
      }

      // =================================================
      // API ERROR
      // =================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to fetch applications."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      const applicationList = Array.isArray(
        data.applications
      )
        ? data.applications
        : [];

      console.log(
        "Total Applications:",
        applicationList.length
      );

      // Debug approved applications
      const approvedApplications =
        applicationList.filter(
          (application) =>
            isApprovedApplication(application)
        );

      console.log(
        "Approved / Accepted Applications:",
        approvedApplications
      );

      setApplications(applicationList);
    } catch (err) {
      console.error(
        "Fetch Applications Error:",
        err
      );

      setError(
        err.message ||
          "Failed to fetch applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD APPLICATIONS
  // =====================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  const updateApplicationStatus = async (
    applicationId,
    status
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        alert(
          "Authentication token is missing. Please login again."
        );
        return;
      }

      setActionLoading(
        `${status}-${applicationId}`
      );

      console.log(
        "Updating application:",
        applicationId,
        "to:",
        status
      );

      const response = await fetch(
        `${API_URL}/api/jobs/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
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
        "Update Application Response:",
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
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        throw new Error(
          data.message ||
            "Authentication failed. Please login again."
        );
      }

      // =================================================
      // API ERROR
      // =================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update application status."
        );
      }

      // =================================================
      // UPDATE LOCAL UI
      // =================================================

      setApplications((previous) =>
        previous.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
              }
            : application
        )
      );

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      if (
        String(status).toLowerCase() ===
        "accepted"
      ) {
        alert(
          "Application accepted successfully."
        );
      } else {
        alert(
          "Application rejected successfully."
        );
      }

      /*
        Re-fetch from backend.

        This is important because it verifies that
        the status was actually saved in PostgreSQL.
      */

      await fetchApplications();
    } catch (err) {
      console.error(
        "Update Application Status Error:",
        err
      );

      alert(
        err.message ||
          "Failed to update application."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // ACCEPT APPLICATION
  // =====================================================

  const handleAccept = (application) => {
    if (isApprovedApplication(application)) {
      alert(
        "This application has already been approved."
      );
      return;
    }

    const confirmed = window.confirm(
      `Accept ${
        application.applicant_name ||
        "this applicant"
      }?`
    );

    if (!confirmed) {
      return;
    }

    /*
      IMPORTANT:

      We continue sending "Accepted" because this is
      the existing application status used by your
      application system.

      The frontend treats Accepted and Approved as
      equivalent when displaying approved applicants.
    */

    updateApplicationStatus(
      application.id,
      "Accepted"
    );
  };

  // =====================================================
  // REJECT APPLICATION
  // =====================================================

  const handleReject = (application) => {
    const currentStatus = normalizeStatus(
      application.status
    );

    if (currentStatus === "rejected") {
      alert(
        "This application has already been rejected."
      );
      return;
    }

    const confirmed = window.confirm(
      `Reject ${
        application.applicant_name ||
        "this applicant"
      }?`
    );

    if (!confirmed) {
      return;
    }

    updateApplicationStatus(
      application.id,
      "Rejected"
    );
  };

  // =====================================================
  // DELETE APPLICATION
  // =====================================================

  const deleteApplication = async (
    application
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the application from ${
        application.applicant_name ||
        "this applicant"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getAuthToken();

      if (!token) {
        alert(
          "Authentication token is missing. Please login again."
        );
        return;
      }

      setActionLoading(
        `delete-${application.id}`
      );

      const response = await fetch(
        `${API_URL}/api/jobs/applications/${application.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
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
        "Delete Application Response:",
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
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        throw new Error(
          data.message ||
            "Authentication failed. Please login again."
        );
      }

      // =================================================
      // API ERROR
      // =================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete application."
        );
      }

      // =================================================
      // REMOVE FROM UI
      // =================================================

      setApplications((previous) =>
        previous.filter(
          (item) =>
            item.id !== application.id
        )
      );

      alert(
        "Application deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete Application Error:",
        err
      );

      alert(
        err.message ||
          "Failed to delete application."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredApplications =
    applications.filter((application) => {
      const text = search
        .toLowerCase()
        .trim();

      if (!text) {
        return true;
      }

      return (
        String(
          application.applicant_name || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          application.email || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          application.phone || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          application.job_title || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          application.title || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          application.company || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          application.status || ""
        )
          .toLowerCase()
          .includes(text)
      );
    });

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    const normalized =
      normalizeStatus(status);

    if (normalized === "approved") {
      return "approved";
    }

    if (normalized === "rejected") {
      return "rejected";
    }

    if (normalized === "shortlisted") {
      return "shortlisted";
    }

    if (normalized === "interview") {
      return "interview";
    }

    return "pending";
  };

  // =====================================================
  // DISPLAY STATUS
  // =====================================================

  /*
    This is the important part.

    Database:
      Accepted

    UI:
      Approved

    So your Approved section and Applicants UI can use
    the same concept without changing the existing
    application status in the database.
  */

  const getDisplayStatus = (status) => {
    if (isApprovedApplication({ status })) {
      return "Approved";
    }

    if (
      String(status || "")
        .trim()
        .toLowerCase() === "rejected"
    ) {
      return "Rejected";
    }

    if (
      String(status || "")
        .trim()
        .toLowerCase() ===
      "shortlisted"
    ) {
      return "Shortlisted";
    }

    if (
      String(status || "")
        .trim()
        .toLowerCase() ===
      "interview"
    ) {
      return "Interview";
    }

    return "Pending";
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

    return value.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // GET INITIAL
  // =====================================================

  const getInitial = (name) => {
    if (!name) {
      return "?";
    }

    return name
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
  // COUNT APPROVED
  // =====================================================

  const approvedCount =
    applications.filter((application) =>
      isApprovedApplication(application)
    ).length;

  // =====================================================
  // COUNT REJECTED
  // =====================================================

  const rejectedCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application.status
        ) === "rejected"
    ).length;

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="applicants-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="applicants-header">

        <div className="applicants-title-section">

          <div className="title-icon">
            <FaUsers />
          </div>

          <div>
            <h1>Applicants</h1>

            <p>
              Review, accept and manage
              candidates who applied for
              your jobs.
            </p>
          </div>

        </div>

        <div className="applicant-count">

          <div className="count-icon">
            <FaUsers />
          </div>

          <div>
            <span className="count-number">
              {applications.length}
            </span>

            <span className="count-label">
              Total Applications
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="applicants-card">

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="applicants-toolbar">

          <div className="toolbar-left">

            <div>
              <h2>
                Candidate Applications
              </h2>

              <p>
                Review candidate applications
                and manage their status.
              </p>
            </div>

            <span className="result-count">
              {filteredApplications.length}{" "}
              Results
            </span>

          </div>

          <div className="toolbar-right">

            <div className="applicants-search">

              <FaSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search applicants..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                  title="Clear Search"
                >
                  <FaTimes />
                </button>
              )}

            </div>

            <button
              className="refresh-btn"
              onClick={fetchApplications}
              disabled={loading}
              type="button"
            >
              <FaSyncAlt
                className={
                  loading
                    ? "refresh-spin"
                    : ""
                }
              />

              <span>Refresh</span>
            </button>

          </div>

        </div>

        {/* =================================================
            APPLICATION SUMMARY
        ================================================= */}

        {!loading && !error && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              padding:
                "0 24px 18px",
              flexWrap: "wrap",
            }}
          >
            <span className="result-count">
              Total: {applications.length}
            </span>

            <span className="result-count">
              Approved: {approvedCount}
            </span>

            <span className="result-count">
              Rejected: {rejectedCount}
            </span>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="applicants-loading">

            <div className="loading-spinner">
              <FaRedo />
            </div>

            <h3>
              Loading applications
            </h3>

            <p>
              Please wait while we fetch
              candidate applications.
            </p>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="applicants-error">

            <div className="error-icon">
              <FaExclamationCircle />
            </div>

            <h3>
              Unable to load applications
            </h3>

            <p>{error}</p>

            <div className="error-actions">

              <button
                className="try-again-btn"
                onClick={fetchApplications}
              >
                <FaRedo />
                Try Again
              </button>

              <button
                className="login-again-btn"
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
          <div className="applicants-table-wrapper">

            <table className="applicants-table">

              <thead>
                <tr>

                  <th>Applicant</th>

                  <th>Contact</th>

                  <th>Job Position</th>

                  <th>Company</th>

                  <th>Applied Date</th>

                  <th>Status</th>

                  <th>Actions</th>

                </tr>
              </thead>

              <tbody>

                {filteredApplications.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="empty-state"
                    >

                      <div className="empty-state-icon">
                        <FaFileAlt />
                      </div>

                      <h3>
                        No Applications Found
                      </h3>

                      <p>
                        {search
                          ? "No applicants match your search."
                          : "No job applications are available yet."}
                      </p>

                      {search && (
                        <button
                          className="clear-filter-btn"
                          onClick={() =>
                            setSearch("")
                          }
                        >
                          <FaTimes />
                          Clear Search
                        </button>
                      )}

                    </td>

                  </tr>

                ) : (

                  filteredApplications.map(
                    (application) => {

                      const approved =
                        isApprovedApplication(
                          application
                        );

                      const normalizedStatus =
                        normalizeStatus(
                          application.status
                        );

                      const isRejected =
                        normalizedStatus ===
                        "rejected";

                      return (
                        <tr
                          key={
                            application.id
                          }
                        >

                          {/* APPLICANT */}

                          <td>

                            <div className="applicant-info">

                              <div className="applicant-avatar">
                                {getInitial(
                                  application.applicant_name
                                )}
                              </div>

                              <div className="applicant-details">

                                <strong>
                                  {application.applicant_name ||
                                    "Unknown Applicant"}
                                </strong>

                                <span>
                                  Application #
                                  {
                                    application.id
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td>

                            <div className="contact-info">

                              <div>
                                <FaEnvelope />

                                <span>
                                  {application.email ||
                                    "No email"}
                                </span>
                              </div>

                              <div>
                                <FaPhone />

                                <span>
                                  {application.phone ||
                                    "No phone"}
                                </span>
                              </div>

                            </div>

                          </td>

                          {/* JOB */}

                          <td>

                            <div className="job-info">

                              <FaBriefcase />

                              <strong>
                                {application.job_title ||
                                  application.title ||
                                  "Unknown Job"}
                              </strong>

                            </div>

                          </td>

                          {/* COMPANY */}

                          <td>

                            <div className="company-info">

                              <FaBuilding />

                              <span>
                                {application.company ||
                                  "Unknown Company"}
                              </span>

                            </div>

                          </td>

                          {/* DATE */}

                          <td>

                            <div className="date-info">

                              <FaCalendarAlt />

                              <span>
                                {formatDate(
                                  application.created_at ||
                                    application.applied_at ||
                                    application.application_date
                                )}
                              </span>

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`application-status ${getStatusClass(
                                application.status
                              )}`}
                            >

                              <span className="status-dot"></span>

                              {getDisplayStatus(
                                application.status
                              )}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="application-actions">

                              {/* ACCEPT */}

                              <button
                                type="button"
                                className="action-btn accept-btn"
                                title={
                                  approved
                                    ? "Already Approved"
                                    : "Accept Application"
                                }
                                disabled={
                                  actionLoading !==
                                    null ||
                                  approved
                                }
                                onClick={() =>
                                  handleAccept(
                                    application
                                  )
                                }
                              >

                                {actionLoading ===
                                `Accepted-${application.id}` ? (
                                  <span className="button-spinner"></span>
                                ) : (
                                  <FaCheck />
                                )}

                                <span>
                                  {approved
                                    ? "Approved"
                                    : "Accept"}
                                </span>

                              </button>

                              {/* REJECT */}

                              <button
                                type="button"
                                className="action-btn reject-btn"
                                title="Reject Application"
                                disabled={
                                  actionLoading !==
                                    null ||
                                  isRejected
                                }
                                onClick={() =>
                                  handleReject(
                                    application
                                  )
                                }
                              >

                                {actionLoading ===
                                `Rejected-${application.id}` ? (
                                  <span className="button-spinner"></span>
                                ) : (
                                  <FaTimes />
                                )}

                                <span>
                                  {isRejected
                                    ? "Rejected"
                                    : "Reject"}
                                </span>

                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                className="action-btn delete-btn"
                                title="Delete Application"
                                disabled={
                                  actionLoading !==
                                  null
                                }
                                onClick={() =>
                                  deleteApplication(
                                    application
                                  )
                                }
                              >

                                {actionLoading ===
                                `delete-${application.id}` ? (
                                  <span className="button-spinner"></span>
                                ) : (
                                  <FaTrash />
                                )}

                                <span>
                                  Delete
                                </span>

                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
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

export default Applicants;