import React, { useEffect, useState } from "react";

import {
  FaChartBar,
  FaBriefcase,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaSyncAlt,
  FaArrowUp,
  FaFileAlt,
  FaUserCheck,
} from "react-icons/fa";

import "./ManagerReports.css";

const API_URL = "http://localhost:5000";

function ManagerReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  // =====================================================
  // TOKEN
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

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // =====================================================
  // GET ARRAY FROM API RESPONSE
  // =====================================================

  const getArray = (data, possibleKeys = []) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of possibleKeys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.data?.rows)) {
      return data.data.rows;
    }

    if (Array.isArray(data?.rows)) {
      return data.rows;
    }

    if (Array.isArray(data?.result)) {
      return data.result;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  // =====================================================
  // FETCH JSON SAFELY
  // =====================================================

  const fetchJSON = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data = {};

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = {
        success: false,
        message: text || "Invalid server response.",
      };
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  // =====================================================
  // FETCH REPORT DATA
  // =====================================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please login again."
        );
      }

      // =================================================
      // JOBS
      // =================================================

      const jobsData = await fetchJSON(
        `${API_URL}/api/jobs`
      );

      const jobsList = getArray(jobsData, [
        "jobs",
        "approvedJobs",
        "jobList",
      ]);

      // =================================================
      // APPLICATIONS
      // =================================================

      const applicationsData = await fetchJSON(
        `${API_URL}/api/jobs/applications`
      );

      const applicationsList = getArray(
        applicationsData,
        [
          "applications",
          "applicationList",
        ]
      );

      // =================================================
      // INTERVIEWS
      // =================================================

      let interviewsList = [];

      try {
        const interviewsData = await fetchJSON(
          `${API_URL}/api/jobs/interviews`
        );

        console.log(
          "INTERVIEW API RAW RESPONSE:",
          interviewsData
        );

        interviewsList = getArray(
          interviewsData,
          [
            "interviews",
            "interview",
            "interviewList",
            "scheduledInterviews",
            "completedInterviews",
          ]
        );

        console.log(
          "INTERVIEW LIST:",
          interviewsList
        );
      } catch (interviewError) {
        console.error(
          "Interview API Error:",
          interviewError
        );

        /*
         * Do not fail the complete report if
         * interview endpoint is unavailable.
         */
        interviewsList = [];
      }

      // =================================================
      // SET DATA
      // =================================================

      setJobs(jobsList);
      setApplications(applicationsList);
      setInterviews(interviewsList);

      console.log(
        "REPORT JOBS:",
        jobsList
      );

      console.log(
        "REPORT APPLICATIONS:",
        applicationsList
      );

      console.log(
        "REPORT INTERVIEWS:",
        interviewsList
      );
    } catch (err) {
      console.error(
        "Manager Reports Error:",
        err
      );

      setError(
        err.message ||
          "Failed to load manager reports."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD REPORTS
  // =====================================================

  useEffect(() => {
    fetchReports();
  }, []);

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  const getStatus = (item) => {
    return String(
      item?.status ||
        item?.interview_status ||
        item?.application_status ||
        ""
    )
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // JOB REPORTS
  // =====================================================

  const totalJobs = jobs.length;

  const approvedJobs = jobs.filter(
    (job) =>
      getStatus(job) === "approved"
  ).length;

  const openJobs = jobs.filter(
    (job) =>
      getStatus(job) === "open"
  ).length;

  const closedJobs = jobs.filter(
    (job) =>
      getStatus(job) === "closed"
  ).length;

  const pendingJobs = jobs.filter(
    (job) =>
      getStatus(job) === "pending"
  ).length;

  // =====================================================
  // APPLICATION REPORTS
  // =====================================================

  const totalApplications =
    applications.length;

  const acceptedApplications =
    applications.filter((application) => {
      const status =
        getStatus(application);

      return (
        status === "accepted" ||
        status === "approved" ||
        status === "selected"
      );
    }).length;

  const rejectedApplications =
    applications.filter(
      (application) =>
        getStatus(application) ===
        "rejected"
    ).length;

  const shortlistedApplications =
    applications.filter(
      (application) =>
        getStatus(application) ===
        "shortlisted"
    ).length;

  const interviewApplications =
    applications.filter(
      (application) => {
        const status =
          getStatus(application);

        return (
          status === "interview" ||
          status === "interview_scheduled" ||
          status === "scheduled"
        );
      }
    ).length;

  // =====================================================
  // INTERVIEW REPORTS
  // =====================================================

  const totalInterviews =
    interviews.length;

  const completedInterviews =
    interviews.filter((interview) => {
      const status =
        getStatus(interview);

      return (
        status === "completed" ||
        status === "complete" ||
        status === "finished" ||
        status === "done"
      );
    }).length;

  const scheduledInterviews =
    interviews.filter((interview) => {
      const status =
        getStatus(interview);

      return (
        status === "scheduled" ||
        status === "upcoming" ||
        status === "pending" ||
        status === "confirmed"
      );
    }).length;

  const cancelledInterviews =
    interviews.filter((interview) => {
      const status =
        getStatus(interview);

      return (
        status === "cancelled" ||
        status === "canceled"
      );
    }).length;

  // =====================================================
  // SUCCESS RATE
  // =====================================================

  const selectionRate =
    totalApplications > 0
      ? Math.round(
          (acceptedApplications /
            totalApplications) *
            100
        )
      : 0;

  // =====================================================
  // TOP JOBS
  // =====================================================

  const jobApplicationCounts =
    jobs
      .map((job) => {
        const jobId = String(
          job.id ||
            job.job_id ||
            ""
        );

        const jobTitle =
          job.title ||
          job.job_title ||
          job.position ||
          job.name ||
          "Untitled Job";

        const count =
          applications.filter(
            (application) => {
              const applicationJobId =
                String(
                  application.job_id ||
                    application.jobId ||
                    application.jobId_fk ||
                    ""
                );

              return (
                applicationJobId ===
                jobId
              );
            }
          ).length;

        return {
          id: jobId,
          title: jobTitle,
          count,
          status: job.status,
        };
      })
      .sort(
        (a, b) =>
          b.count - a.count
      )
      .slice(0, 5);

  // =====================================================
  // PERCENTAGE
  // =====================================================

  const getPercentage = (
    value,
    total
  ) => {
    if (!total) {
      return 0;
    }

    return Math.round(
      (value / total) * 100
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="manager-reports-page">
        <div className="reports-loading">

          <FaSyncAlt className="reports-spin" />

          <h3>
            Loading Reports
          </h3>

          <p>
            Preparing your recruitment
            analytics...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="manager-reports-page">

        <div className="reports-error">

          <FaTimesCircle />

          <h3>
            Unable to Load Reports
          </h3>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchReports}
          >
            <FaSyncAlt />
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="manager-reports-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <div className="reports-header-left">

          <div className="reports-header-icon">
            <FaChartBar />
          </div>

          <div>

            <span className="reports-eyebrow">
              Manager Analytics
            </span>

            <h1>
              Recruitment Reports
            </h1>

            <p>
              Monitor jobs, applicants,
              interviews and recruitment
              performance.
            </p>

          </div>

        </div>

        <button
          type="button"
          className="reports-refresh-btn"
          onClick={fetchReports}
        >
          <FaSyncAlt />
          Refresh Reports
        </button>

      </div>

      {/* =================================================
          OVERVIEW CARDS
      ================================================= */}

      <div className="reports-stat-grid">

        <div className="report-stat-card">

          <div className="report-stat-icon jobs">
            <FaBriefcase />
          </div>

          <div>
            <span>Total Jobs</span>

            <strong>
              {totalJobs}
            </strong>

            <small>
              All jobs in system
            </small>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon approved">
            <FaCheckCircle />
          </div>

          <div>
            <span>Approved Jobs</span>

            <strong>
              {approvedJobs}
            </strong>

            <small>
              Approved job postings
            </small>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon applications">
            <FaUsers />
          </div>

          <div>
            <span>Applications</span>

            <strong>
              {totalApplications}
            </strong>

            <small>
              Total applications
            </small>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon selected">
            <FaUserCheck />
          </div>

          <div>
            <span>Selected</span>

            <strong>
              {acceptedApplications}
            </strong>

            <small>
              Successful applicants
            </small>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon interviews">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Interviews</span>

            <strong>
              {totalInterviews}
            </strong>

            <small>
              Total interviews
            </small>
          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon rate">
            <FaArrowUp />
          </div>

          <div>
            <span>Selection Rate</span>

            <strong>
              {selectionRate}%
            </strong>

            <small>
              Application success
            </small>
          </div>

        </div>

      </div>

      {/* =================================================
          JOB STATUS + APPLICATION STATUS
      ================================================= */}

      <div className="reports-two-column">

        {/* JOB STATUS */}

        <div className="report-panel">

          <div className="report-panel-header">

            <div>

              <h2>
                Job Status
              </h2>

              <p>
                Current status of job
                postings.
              </p>

            </div>

            <FaBriefcase />

          </div>

          <div className="status-list">

            {/* APPROVED */}

            <div className="status-row">

              <div>
                <span className="status-dot approved-dot" />

                <strong>
                  Approved
                </strong>
              </div>

              <div>
                <b>
                  {approvedJobs}
                </b>

                <span>
                  {getPercentage(
                    approvedJobs,
                    totalJobs
                  )}%
                </span>
              </div>

            </div>

            <div className="progress">

              <div
                className="progress-approved"
                style={{
                  width: `${getPercentage(
                    approvedJobs,
                    totalJobs
                  )}%`,
                }}
              />

            </div>

            {/* OPEN */}

            <div className="status-row">

              <div>
                <span className="status-dot open-dot" />

                <strong>
                  Open
                </strong>
              </div>

              <div>

                <b>
                  {openJobs}
                </b>

                <span>
                  {getPercentage(
                    openJobs,
                    totalJobs
                  )}%
                </span>

              </div>

            </div>

            <div className="progress">

              <div
                className="progress-open"
                style={{
                  width: `${getPercentage(
                    openJobs,
                    totalJobs
                  )}%`,
                }}
              />

            </div>

            {/* PENDING */}

            <div className="status-row">

              <div>

                <span className="status-dot pending-dot" />

                <strong>
                  Pending
                </strong>

              </div>

              <div>

                <b>
                  {pendingJobs}
                </b>

                <span>
                  {getPercentage(
                    pendingJobs,
                    totalJobs
                  )}%
                </span>

              </div>

            </div>

            <div className="progress">

              <div
                className="progress-pending"
                style={{
                  width: `${getPercentage(
                    pendingJobs,
                    totalJobs
                  )}%`,
                }}
              />

            </div>

            {/* CLOSED */}

            <div className="status-row">

              <div>

                <span className="status-dot closed-dot" />

                <strong>
                  Closed
                </strong>

              </div>

              <div>

                <b>
                  {closedJobs}
                </b>

                <span>
                  {getPercentage(
                    closedJobs,
                    totalJobs
                  )}%
                </span>

              </div>

            </div>

            <div className="progress">

              <div
                className="progress-closed"
                style={{
                  width: `${getPercentage(
                    closedJobs,
                    totalJobs
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* APPLICATION STATUS */}

        <div className="report-panel">

          <div className="report-panel-header">

            <div>

              <h2>
                Application Status
              </h2>

              <p>
                Applicant recruitment
                pipeline.
              </p>

            </div>

            <FaUsers />

          </div>

          <div className="application-summary">

            <div className="application-summary-item">
              <span>
                Applied
              </span>

              <strong>
                {totalApplications}
              </strong>
            </div>

            <div className="application-summary-item">
              <span>
                Shortlisted
              </span>

              <strong>
                {shortlistedApplications}
              </strong>
            </div>

            <div className="application-summary-item">
              <span>
                Interview
              </span>

              <strong>
                {interviewApplications}
              </strong>
            </div>

            <div className="application-summary-item">

              <span>
                Selected
              </span>

              <strong className="success-text">
                {acceptedApplications}
              </strong>

            </div>

            <div className="application-summary-item">

              <span>
                Rejected
              </span>

              <strong className="danger-text">
                {rejectedApplications}
              </strong>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          INTERVIEW OVERVIEW
      ================================================= */}

      <div className="report-panel interview-report">

        <div className="report-panel-header">

          <div>

            <h2>
              Interview Overview
            </h2>

            <p>
              Live interview activity
              from the interviews backend.
            </p>

          </div>

          <FaCalendarAlt />

        </div>

        <div className="interview-grid">

          {/* TOTAL */}

          <div className="interview-card">

            <span>
              Total Interviews
            </span>

            <strong>
              {totalInterviews}
            </strong>

          </div>

          {/* SCHEDULED */}

          <div className="interview-card">

            <span>
              Scheduled
            </span>

            <strong>
              {scheduledInterviews}
            </strong>

          </div>

          {/* COMPLETED */}

          <div className="interview-card">

            <span>
              Completed
            </span>

            <strong>
              {completedInterviews}
            </strong>

          </div>

          {/* CANCELLED */}

          <div className="interview-card">

            <span>
              Cancelled
            </span>

            <strong>
              {cancelledInterviews}
            </strong>

          </div>

        </div>

        {/* DEBUG / BACKEND STATUS */}

        <div
          style={{
            marginTop: "20px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#f8fafc",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          Connected interview records:{" "}
          <strong>
            {interviews.length}
          </strong>
        </div>

      </div>

      {/* =================================================
          TOP JOBS
      ================================================= */}

      <div className="report-panel">

        <div className="report-panel-header">

          <div>

            <h2>
              Top Jobs by Applications
            </h2>

            <p>
              Jobs receiving the most
              applications.
            </p>

          </div>

          <FaFileAlt />

        </div>

        {jobApplicationCounts.length === 0 ? (

          <div className="report-empty">

            <FaBriefcase />

            <p>
              No job data available.
            </p>

          </div>

        ) : (

          <div className="top-jobs-list">

            {jobApplicationCounts.map(
              (job, index) => (

                <div
                  className="top-job-row"
                  key={
                    job.id ||
                    index
                  }
                >

                  <div className="top-job-number">
                    {index + 1}
                  </div>

                  <div className="top-job-info">

                    <strong>
                      {job.title}
                    </strong>

                    <span>
                      Status:{" "}
                      {job.status ||
                        "Unknown"}
                    </span>

                  </div>

                  <div className="top-job-count">

                    <strong>
                      {job.count}
                    </strong>

                    <span>
                      Applications
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default ManagerReports;