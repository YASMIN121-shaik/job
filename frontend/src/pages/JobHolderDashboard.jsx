import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaUsers,
  FaClipboardCheck,
  FaCalendarAlt,
  FaPlus,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaRedo,
} from "react-icons/fa";

import "./JobHolderDashboard.css";

const API_URL = "http://localhost:5000";

function JobHolderDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dashboard, setDashboard] = useState({
    user: null,

    stats: {
      totalJobs: 0,
      activeJobs: 0,
      totalApplicants: 0,
      totalInterviews: 0,
    },

    recentJobs: [],
  });

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")
    );
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const goToCreateJob = () => {
    navigate("/jobholder/create-job");
  };

  const goToJobs = () => {
    navigate("/jobholder/jobs");
  };

  const goToApplicants = () => {
    navigate("/jobholder/applicants");
  };

  const goToInterviews = () => {
    navigate("/jobholder/interviews");
  };

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token is required. Please login again."
        );

        return;
      }

      console.log(
        "Fetching Job Holder Dashboard..."
      );

      const response = await axios.get(
        `${API_URL}/api/jobholder/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "JOB HOLDER DASHBOARD RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        setDashboard({
          user:
            response.data.user || null,

          stats: {
            totalJobs:
              Number(
                response.data.stats?.totalJobs || 0
              ),

            activeJobs:
              Number(
                response.data.stats?.activeJobs || 0
              ),

            totalApplicants:
              Number(
                response.data.stats?.totalApplicants || 0
              ),

            totalInterviews:
              Number(
                response.data.stats?.totalInterviews || 0
              ),
          },

          recentJobs:
            Array.isArray(
              response.data.recentJobs
            )
              ? response.data.recentJobs
              : [],
        });

      } else {
        setError(
          response.data?.message ||
            "Unable to load dashboard"
        );
      }

    } catch (error) {
      console.error(
        "JOB HOLDER DASHBOARD ERROR:",
        error.response?.data || error
      );

      if (
        error.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );

      } else if (
        error.response?.status === 403
      ) {
        setError(
          error.response?.data?.message ||
            "You are not authorized to access this dashboard."
        );

      } else {
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Unable to load dashboard"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="jobholder-dashboard">

        <div className="jh-loading">

          <div className="jh-spinner"></div>

          <p>
            Loading dashboard...
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
      <div className="jobholder-dashboard">

        <div className="jh-error">

          <div className="jh-error-icon">
            <FaBriefcase />
          </div>

          <h3>
            Unable to load dashboard
          </h3>

          <p>
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="jh-retry-btn"
          >
            <FaRedo />
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const {
    stats,
    recentJobs,
    user,
  } = dashboard;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="jobholder-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="jobholder-dashboard-header">

        <div>

          <span className="jh-welcome-label">
            JOB HOLDER DASHBOARD
          </span>

          <h1>
            Welcome,{" "}
            {user?.fullname ||
              "Job Holder"}
          </h1>

          <p>
            Manage your jobs, applicants
            and interviews from one place.
          </p>

        </div>

        <button
          className="jh-create-btn"
          onClick={goToCreateJob}
          type="button"
        >
          <FaPlus />
          Create Job
        </button>

      </div>


      {/* =================================================
          STATS
      ================================================= */}

      <div className="jh-stats-grid">

        {/* TOTAL JOBS */}

        <div className="jh-stat-card">

          <div className="jh-stat-icon jobs">
            <FaBriefcase />
          </div>

          <div className="jh-stat-info">

            <span>
              Total Jobs
            </span>

            <h2>
              {stats.totalJobs}
            </h2>

            <small>
              Jobs posted
            </small>

          </div>

        </div>


        {/* ACTIVE JOBS */}

        <div className="jh-stat-card">

          <div className="jh-stat-icon active">
            <FaCheckCircle />
          </div>

          <div className="jh-stat-info">

            <span>
              Active Jobs
            </span>

            <h2>
              {stats.activeJobs}
            </h2>

            <small>
              Currently active
            </small>

          </div>

        </div>


        {/* APPLICANTS */}

        <div
          className="jh-stat-card jh-clickable-card"
          onClick={goToApplicants}
        >

          <div className="jh-stat-icon applicants">
            <FaUsers />
          </div>

          <div className="jh-stat-info">

            <span>
              Applicants
            </span>

            <h2>
              {stats.totalApplicants}
            </h2>

            <small>
              Total applicants
            </small>

          </div>

        </div>


        {/* INTERVIEWS */}

        <div
          className="jh-stat-card jh-clickable-card"
          onClick={goToInterviews}
        >

          <div className="jh-stat-icon interviews">
            <FaCalendarAlt />
          </div>

          <div className="jh-stat-info">

            <span>
              Interviews
            </span>

            <h2>
              {stats.totalInterviews}
            </h2>

            <small>
              Scheduled interviews
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="jh-dashboard-grid">


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="jh-dashboard-card">

          <div className="jh-card-header">

            <div>

              <h3>
                Quick Actions
              </h3>

              <p>
                Manage your recruitment activities
              </p>

            </div>

          </div>


          <div className="jh-actions">

            {/* CREATE JOB */}

            <button
              className="jh-action-item"
              onClick={goToCreateJob}
              type="button"
            >

              <div className="jh-action-icon">
                <FaPlus />
              </div>

              <div className="jh-action-text">

                <strong>
                  Create New Job
                </strong>

                <span>
                  Post a new job opening
                </span>

              </div>

              <FaArrowRight
                className="jh-action-arrow"
              />

            </button>


            {/* MANAGE JOBS */}

            <button
              className="jh-action-item"
              onClick={goToJobs}
              type="button"
            >

              <div className="jh-action-icon">
                <FaBriefcase />
              </div>

              <div className="jh-action-text">

                <strong>
                  Manage Jobs
                </strong>

                <span>
                  View and manage your jobs
                </span>

              </div>

              <FaArrowRight
                className="jh-action-arrow"
              />

            </button>


            {/* APPLICANTS */}

            <button
              className="jh-action-item"
              onClick={goToApplicants}
              type="button"
            >

              <div className="jh-action-icon">
                <FaUsers />
              </div>

              <div className="jh-action-text">

                <strong>
                  View Applicants
                </strong>

                <span>
                  Review job applications
                </span>

              </div>

              <FaArrowRight
                className="jh-action-arrow"
              />

            </button>


            {/* INTERVIEWS */}

            <button
              className="jh-action-item"
              onClick={goToInterviews}
              type="button"
            >

              <div className="jh-action-icon">
                <FaCalendarAlt />
              </div>

              <div className="jh-action-text">

                <strong>
                  Manage Interviews
                </strong>

                <span>
                  View scheduled interviews
                </span>

              </div>

              <FaArrowRight
                className="jh-action-arrow"
              />

            </button>

          </div>

        </div>


        {/* =================================================
            RECENT JOBS
        ================================================= */}

        <div className="jh-dashboard-card">

          <div className="jh-card-header">

            <div>

              <h3>
                Recent Jobs
              </h3>

              <p>
                Your latest job postings
              </p>

            </div>

            <button
              className="jh-view-all-btn"
              onClick={goToJobs}
              type="button"
            >
              View All
              <FaArrowRight />
            </button>

          </div>


          {recentJobs.length === 0 ? (

            <div className="jh-empty-state">

              <div className="jh-empty-icon">
                <FaClock />
              </div>

              <h4>
                No Jobs Yet
              </h4>

              <p>
                Create your first job
                posting to get started.
              </p>

              <button
                className="jh-empty-create-btn"
                onClick={goToCreateJob}
                type="button"
              >
                <FaPlus />
                Create Job
              </button>

            </div>

          ) : (

            <div className="jh-recent-jobs">

              {recentJobs.map(
                (job, index) => (

                  <div
                    className="jh-recent-job"
                    key={
                      job.id ||
                      job.job_id ||
                      index
                    }
                  >

                    <div className="jh-recent-job-left">

                      <div className="jh-recent-job-icon">
                        <FaBriefcase />
                      </div>

                      <div>

                        <strong>
                          {job.title ||
                            "Untitled Job"}
                        </strong>

                        <span>
                          {job.location ||
                            "Location not specified"}
                        </span>

                      </div>

                    </div>

                    <span
                      className={`jh-job-status ${
                        String(
                          job.status || ""
                        )
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )
                      }`}
                    >
                      {job.status ||
                        "Active"}
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          GET STARTED
      ================================================= */}

      <div className="jh-get-started">

        <div className="jh-get-icon">
          <FaBriefcase />
        </div>

        <div className="jh-get-content">

          <h3>
            Start hiring with Job Portal
          </h3>

          <p>
            Create a job posting and
            start finding the right
            candidates.
          </p>

        </div>

        <button
          className="jh-get-btn"
          onClick={goToCreateJob}
          type="button"
        >

          Create Your First Job

          <FaArrowRight />

        </button>

      </div>

    </div>
  );
}

export default JobHolderDashboard;