import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaSyncAlt,
  FaTimesCircle,
  FaUserCheck,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaChevronRight,
  FaFileAlt,
  FaVideo,
  FaFilter,
} from "react-icons/fa";

import "./JobTracker.css";

const API_URL = "http://localhost:5000";

function JobTracker() {
  // =====================================================
  // STATE
  // =====================================================

  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const user = localStorage.getItem("user");

      if (!user) {
        return null;
      }

      return JSON.parse(user);
    } catch (err) {
      console.error(
        "Failed to read logged-in user:",
        err
      );

      return null;
    }
  };

  // =====================================================
  // GET TOKEN
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
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const user = getLoggedInUser();
      const token = getToken();

      if (!user || !user.email) {
        throw new Error(
          "Logged-in user information is missing. Please login again."
        );
      }

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/jobseeker/applications?email=${encodeURIComponent(
          user.email
        )}`,
        {
          method: "GET",
          headers,
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

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          data.message ||
            "Authentication failed. Please login again."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to fetch applications."
        );
      }

      setApplications(
        Array.isArray(data.applications)
          ? data.applications
          : []
      );
    } catch (err) {
      console.error(
        "JOB TRACKER ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load your applications."
      );

      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  const normalizeStatus = (status) => {
    const value = String(
      status || "applied"
    )
      .trim()
      .toLowerCase()
      .replace(/-/g, "_")
      .replace(/\s+/g, "_");

    if (
      value === "selected" ||
      value === "hired"
    ) {
      return "selected";
    }

    if (
      value === "rejected" ||
      value === "declined"
    ) {
      return "rejected";
    }

    if (
      value === "interview" ||
      value === "interview_scheduled" ||
      value === "interview_completed"
    ) {
      return "interview";
    }

    if (
      value === "accepted" ||
      value === "approved"
    ) {
      return "accepted";
    }

    if (
      value === "shortlisted" ||
      value === "shortlist"
    ) {
      return "shortlisted";
    }

    return "applied";
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {
    const normalized =
      normalizeStatus(status);

    const labels = {
      applied: "Applied",
      shortlisted: "Shortlisted",
      accepted: "Accepted",
      interview: "Interview",
      selected: "Selected",
      rejected: "Rejected",
    };

    return (
      labels[normalized] || "Applied"
    );
  };

  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status) => {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "shortlisted":
        return <FaClock />;

      case "accepted":
        return <FaCheckCircle />;

      case "interview":
        return <FaUserCheck />;

      case "selected":
        return <FaCheckCircle />;

      case "rejected":
        return <FaTimesCircle />;

      default:
        return <FaFileAlt />;
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
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

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return time;
    }

    const hours = parseInt(
      parts[0],
      10
    );

    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return time;
    }

    const suffix =
      hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 === 0
        ? 12
        : hours % 12;

    return `${displayHour}:${minutes} ${suffix}`;
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    return {
      total: applications.length,

      applied: applications.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "applied"
      ).length,

      shortlisted: applications.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "shortlisted"
      ).length,

      accepted: applications.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "accepted"
      ).length,

      interview: applications.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "interview"
      ).length,

      selected: applications.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "selected"
      ).length,

      rejected: applications.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "rejected"
      ).length,
    };
  }, [applications]);

  // =====================================================
  // FILTERED APPLICATIONS
  // =====================================================

  const filteredApplications = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return applications.filter(
      (application) => {
        const normalized =
          normalizeStatus(
            application.status
          );

        const jobTitle = String(
          application.job_title ||
            application.title ||
            application.job_name ||
            ""
        ).toLowerCase();

        const company = String(
          application.company ||
            application.company_name ||
            ""
        ).toLowerCase();

        const location = String(
          application.location || ""
        ).toLowerCase();

        const status = String(
          application.status || ""
        ).toLowerCase();

        const matchesSearch =
          !query ||
          jobTitle.includes(query) ||
          company.includes(query) ||
          location.includes(query) ||
          status.includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          normalized === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    applications,
    search,
    statusFilter,
  ]);

  // =====================================================
  // PROGRESS
  // =====================================================

  const getProgressStep = (status) => {
    const normalized =
      normalizeStatus(status);

    switch (normalized) {
      case "applied":
        return 1;

      case "shortlisted":
        return 2;

      case "accepted":
        return 3;

      case "interview":
        return 4;

      case "selected":
      case "rejected":
        return 5;

      default:
        return 1;
    }
  };

  // =====================================================
  // PROGRESS WIDTH
  // =====================================================

  const getProgressWidth = (step) => {
    if (step <= 1) {
      return "0%";
    }

    if (step === 2) {
      return "25%";
    }

    if (step === 3) {
      return "50%";
    }

    if (step === 4) {
      return "75%";
    }

    return "100%";
  };

  // =====================================================
  // STATUS FILTER OPTIONS
  // =====================================================

  const filterOptions = [
    {
      value: "all",
      label: "All Applications",
      count: statistics.total,
    },
    {
      value: "applied",
      label: "Applied",
      count: statistics.applied,
    },
    {
      value: "shortlisted",
      label: "Shortlisted",
      count: statistics.shortlisted,
    },
    {
      value: "accepted",
      label: "Accepted",
      count: statistics.accepted,
    },
    {
      value: "interview",
      label: "Interview",
      count: statistics.interview,
    },
    {
      value: "selected",
      label: "Selected",
      count: statistics.selected,
    },
    {
      value: "rejected",
      label: "Rejected",
      count: statistics.rejected,
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="job-tracker-page">
        <div className="job-tracker-loading">
          <FaSyncAlt className="tracker-spin" />

          <h3>
            Loading your applications...
          </h3>

          <p>
            Please wait while we load your
            application tracker.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="job-tracker-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="job-tracker-header">

        <div className="job-tracker-header-left">

          <div className="job-tracker-header-icon">
            <FaBriefcase />
          </div>

          <div>
            <span className="tracker-eyebrow">
              APPLICATION MANAGEMENT
            </span>

            <h1>
              Job Tracker
            </h1>

            <p>
              Track every stage of your job
              applications from application to
              final decision.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="tracker-refresh-btn"
          onClick={fetchApplications}
        >
          <FaSyncAlt />
          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="tracker-error-banner">

          <div className="tracker-error-content">

            <FaExclamationCircle />

            <div>

              <strong>
                Unable to load applications
              </strong>

              <span>
                {error}
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={fetchApplications}
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="tracker-statistics">

        <div
          className={`tracker-stat-card ${
            statusFilter === "all"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter("all")
          }
        >
          <div className="tracker-stat-icon all">
            <FaBriefcase />
          </div>

          <div>
            <span>
              Total Applications
            </span>

            <strong>
              {statistics.total}
            </strong>
          </div>
        </div>

        <div
          className={`tracker-stat-card ${
            statusFilter === "applied"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter("applied")
          }
        >
          <div className="tracker-stat-icon applied">
            <FaFileAlt />
          </div>

          <div>
            <span>
              Applied
            </span>

            <strong>
              {statistics.applied}
            </strong>
          </div>
        </div>

        <div
          className={`tracker-stat-card ${
            statusFilter === "shortlisted"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter("shortlisted")
          }
        >
          <div className="tracker-stat-icon shortlisted">
            <FaClock />
          </div>

          <div>
            <span>
              Shortlisted
            </span>

            <strong>
              {statistics.shortlisted}
            </strong>
          </div>
        </div>

        <div
          className={`tracker-stat-card ${
            statusFilter === "interview"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter("interview")
          }
        >
          <div className="tracker-stat-icon interview">
            <FaUserCheck />
          </div>

          <div>
            <span>
              Interviews
            </span>

            <strong>
              {statistics.interview}
            </strong>
          </div>
        </div>

        <div
          className={`tracker-stat-card ${
            statusFilter === "selected"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter("selected")
          }
        >
          <div className="tracker-stat-icon selected">
            <FaCheckCircle />
          </div>

          <div>
            <span>
              Selected
            </span>

            <strong>
              {statistics.selected}
            </strong>
          </div>
        </div>

        <div
          className={`tracker-stat-card ${
            statusFilter === "rejected"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter("rejected")
          }
        >
          <div className="tracker-stat-icon rejected">
            <FaTimesCircle />
          </div>

          <div>
            <span>
              Rejected
            </span>

            <strong>
              {statistics.rejected}
            </strong>
          </div>
        </div>

      </section>

      {/* =================================================
          APPLICATION SECTION
      ================================================= */}

      <section className="job-tracker-content">

        <div className="tracker-content-header">

          <div>

            <span className="tracker-section-label">
              APPLICATIONS
            </span>

            <h2>
              My Applications
            </h2>

            <p>
              Follow your application progress
              step by step.
            </p>

          </div>

          <div className="tracker-controls">

            {/* SEARCH */}

            <div className="tracker-search-box">

              <FaSearch />

              <input
                type="text"
                placeholder="Search job, company..."
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
                >
                  ×
                </button>
              )}

            </div>

            {/* FILTER */}

            <div className="tracker-status-filter">

              <FaFilter />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                {filterOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label} (
                      {option.count})
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

        </div>

        {/* =================================================
            FILTER RESULT
        ================================================= */}

        <div className="tracker-result-header">

          <div>
            Showing{" "}
            <strong>
              {filteredApplications.length}
            </strong>{" "}
            of{" "}
            <strong>
              {applications.length}
            </strong>{" "}
            applications
          </div>

          {(search ||
            statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error &&
          filteredApplications.length ===
            0 && (

          <div className="tracker-empty">

            <div className="tracker-empty-icon">
              <FaBriefcase />
            </div>

            <h3>
              {search
                ? "No matching applications"
                : statusFilter !== "all"
                ? `No ${getStatusLabel(
                    statusFilter
                  ).toLowerCase()} applications`
                : "No applications found"}
            </h3>

            <p>
              {search
                ? "Try another search term or clear the filters."
                : statusFilter !== "all"
                ? "Try another status or show all applications."
                : "There are no applications to display yet."}
            </p>

            {(search ||
              statusFilter !== "all") && (
              <button
                type="button"
                className="tracker-empty-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Show All Applications
              </button>
            )}

          </div>
        )}

        {/* =================================================
            APPLICATION LIST
        ================================================= */}

        <div className="tracker-application-list">

          {filteredApplications.map(
            (application) => {

              const status =
                normalizeStatus(
                  application.status
                );

              const progress =
                getProgressStep(
                  application.status
                );

              const progressWidth =
                getProgressWidth(
                  progress
                );

              const isRejected =
                status === "rejected";

              const isSelected =
                status === "selected";

              const isInterview =
                status === "interview";

              const interviewDate =
                application.interview_date;

              const interviewTime =
                application.interview_time;

              return (
                <article
                  className={`tracker-application-card ${
                    isRejected
                      ? "is-rejected"
                      : ""
                  } ${
                    isSelected
                      ? "is-selected"
                      : ""
                  }`}
                  key={
                    application.id
                  }
                >

                  {/* =====================================
                      CARD HEADER
                  ===================================== */}

                  <div className="tracker-card-header">

                    <div className="tracker-job-main">

                      <div className="tracker-job-avatar">
                        <FaBriefcase />
                      </div>

                      <div>

                        <h3>
                          {application.job_title ||
                            application.title ||
                            application.job_name ||
                            "Job Position"}
                        </h3>

                        <div className="tracker-company-name">

                          <FaBuilding />

                          <span>
                            {application.company_name ||
                              application.company ||
                              "Company not specified"}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div
                      className={`tracker-current-badge ${status}`}
                    >
                      {getStatusIcon(
                        application.status
                      )}

                      <span>
                        {getStatusLabel(
                          application.status
                        )}
                      </span>
                    </div>

                  </div>

                  {/* =====================================
                      JOB DETAILS
                  ===================================== */}

                  <div className="tracker-details">

                    <div className="tracker-detail-item">

                      <FaMapMarkerAlt />

                      <div>

                        <small>
                          Location
                        </small>

                        <strong>
                          {application.location ||
                            "Not specified"}
                        </strong>

                      </div>

                    </div>

                    <div className="tracker-detail-item">

                      <FaCalendarAlt />

                      <div>

                        <small>
                          Applied On
                        </small>

                        <strong>
                          {formatDate(
                            application.applied_at ||
                              application.created_at
                          )}
                        </strong>

                      </div>

                    </div>

                    <div className="tracker-detail-item">

                      <FaBriefcase />

                      <div>

                        <small>
                          Job Type
                        </small>

                        <strong>
                          {application.job_type ||
                            "Not specified"}
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* =====================================
                      NORMAL PROGRESS
                  ===================================== */}

                  {!isRejected && (
                    <div className="tracker-flow">

                      <div className="tracker-flow-line">

                        <div
                          className="tracker-flow-line-active"
                          style={{
                            width:
                              progressWidth,
                          }}
                        />

                      </div>

                      <div className="tracker-flow-steps">

                        <div
                          className={`tracker-flow-step ${
                            progress >= 1
                              ? "completed"
                              : ""
                          }`}
                        >

                          <div className="tracker-flow-circle">
                            <FaFileAlt />
                          </div>

                          <span>
                            Applied
                          </span>

                        </div>

                        <div
                          className={`tracker-flow-step ${
                            progress >= 2
                              ? "completed"
                              : ""
                          }`}
                        >

                          <div className="tracker-flow-circle">
                            <FaClock />
                          </div>

                          <span>
                            Shortlisted
                          </span>

                        </div>

                        <div
                          className={`tracker-flow-step ${
                            progress >= 3
                              ? "completed"
                              : ""
                          }`}
                        >

                          <div className="tracker-flow-circle">
                            <FaCheckCircle />
                          </div>

                          <span>
                            Accepted
                          </span>

                        </div>

                        <div
                          className={`tracker-flow-step ${
                            progress >= 4
                              ? "completed"
                              : ""
                          }`}
                        >

                          <div className="tracker-flow-circle">
                            <FaUserCheck />
                          </div>

                          <span>
                            Interview
                          </span>

                        </div>

                        <div
                          className={`tracker-flow-step ${
                            progress >= 5 &&
                            isSelected
                              ? "completed"
                              : ""
                          }`}
                        >

                          <div className="tracker-flow-circle">
                            <FaCheckCircle />
                          </div>

                          <span>
                            Selected
                          </span>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* =====================================
                      REJECTED FLOW
                  ===================================== */}

                  {isRejected && (
                    <div className="tracker-flow rejected-flow">

                      <div className="tracker-flow-line">

                        <div
                          className="tracker-flow-line-active"
                          style={{
                            width: "100%",
                          }}
                        />

                      </div>

                      <div className="tracker-flow-steps">

                        <div className="tracker-flow-step completed">

                          <div className="tracker-flow-circle">
                            <FaFileAlt />
                          </div>

                          <span>
                            Applied
                          </span>

                        </div>

                        <div className="tracker-flow-step completed">

                          <div className="tracker-flow-circle">
                            <FaClock />
                          </div>

                          <span>
                            Shortlisted
                          </span>

                        </div>

                        <div className="tracker-flow-step completed">

                          <div className="tracker-flow-circle">
                            <FaCheckCircle />
                          </div>

                          <span>
                            Accepted
                          </span>

                        </div>

                        <div className="tracker-flow-step completed">

                          <div className="tracker-flow-circle">
                            <FaUserCheck />
                          </div>

                          <span>
                            Interview
                          </span>

                        </div>

                        <div className="tracker-flow-step rejected">

                          <div className="tracker-flow-circle">
                            <FaTimesCircle />
                          </div>

                          <span>
                            Rejected
                          </span>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* =====================================
                      INTERVIEW INFORMATION
                  ===================================== */}

                  {isInterview && (
                    <div className="tracker-interview-box">

                      <div className="tracker-interview-title">

                        <div className="tracker-interview-icon">
                          <FaVideo />
                        </div>

                        <div>

                          <strong>
                            Interview Scheduled
                          </strong>

                          <span>
                            You have reached the
                            interview stage.
                          </span>

                        </div>

                      </div>

                      <div className="tracker-interview-details">

                        {interviewDate && (
                          <div>

                            <FaCalendarAlt />

                            <div>

                              <small>
                                Date
                              </small>

                              <strong>
                                {formatDate(
                                  interviewDate
                                )}
                              </strong>

                            </div>

                          </div>
                        )}

                        {interviewTime && (
                          <div>

                            <FaClock />

                            <div>

                              <small>
                                Time
                              </small>

                              <strong>
                                {formatTime(
                                  interviewTime
                                )}
                              </strong>

                            </div>

                          </div>
                        )}

                        {application.interview_type && (
                          <div>

                            <FaVideo />

                            <div>

                              <small>
                                Type
                              </small>

                              <strong>
                                {
                                  application.interview_type
                                }
                              </strong>

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  )}

                  {/* =====================================
                      SELECTED MESSAGE
                  ===================================== */}

                  {isSelected && (
                    <div className="tracker-result-box selected">

                      <div className="tracker-result-icon">
                        <FaCheckCircle />
                      </div>

                      <div>

                        <strong>
                          Congratulations! You are
                          selected.
                        </strong>

                        <p>
                          You successfully completed
                          the interview process and
                          were selected for this
                          position.
                        </p>

                      </div>

                    </div>
                  )}

                  {/* =====================================
                      REJECTED MESSAGE
                  ===================================== */}

                  {isRejected && (
                    <div className="tracker-result-box rejected">

                      <div className="tracker-result-icon">
                        <FaTimesCircle />
                      </div>

                      <div>

                        <strong>
                          Application Rejected
                        </strong>

                        <p>
                          This application was not
                          selected after the interview
                          process.
                        </p>

                      </div>

                    </div>
                  )}

                  {/* =====================================
                      FOOTER
                  ===================================== */}

                  <div className="tracker-card-footer">

                    <span>
                      Application #
                      {application.id}
                    </span>

                    <div>

                      <span>
                        Current Status
                      </span>

                      <strong>
                        {getStatusLabel(
                          application.status
                        )}
                      </strong>

                      <FaChevronRight />

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>

      </section>

    </div>
  );
}

export default JobTracker;