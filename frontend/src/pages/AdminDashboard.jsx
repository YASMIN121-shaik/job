import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./AdminDashboard.css";

import {
  FaUsers,
  FaUserTie,
  FaBriefcase,
  FaChartLine,
  FaClipboardList,
  FaFileAlt,
  FaSyncAlt,
  FaArrowRight,
} from "react-icons/fa";

// =====================================================
// API CONFIG
// =====================================================

const API_URL = "http://localhost:5000";

// =====================================================
// DEFAULT STATS
// =====================================================

const DEFAULT_STATS = {
  totalUsers: 0,
  jobSeekers: 0,
  jobHolders: 0,
  totalJobs: 0,
};

// =====================================================
// ADMIN DASHBOARD
// =====================================================

function AdminDashboard() {
  const navigate = useNavigate();

  // ===================================================
  // DASHBOARD STATS
  // ===================================================

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  // ===================================================
  // RECENT ACTIVITIES
  // ===================================================

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] =
    useState(false);

  // ===================================================
  // FETCH ADMIN STATS
  // ===================================================

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError("");

      const response = await axios.get(
        `${API_URL}/api/admin/stats`
      );

      console.log(
        "ADMIN STATS RESPONSE:",
        response.data
      );

      if (
        !response.data ||
        response.data.success === false
      ) {
        throw new Error(
          response.data?.message ||
            "Failed to fetch admin statistics"
        );
      }

      const data =
        response.data.stats ||
        response.data.data ||
        response.data;

      setStats({
        totalUsers:
          Number(
            data.totalUsers ??
              data.total_users ??
              0
          ) || 0,

        jobSeekers:
          Number(
            data.jobSeekers ??
              data.job_seekers ??
              0
          ) || 0,

        jobHolders:
          Number(
            data.jobHolders ??
              data.job_holders ??
              data.managers ??
              0
          ) || 0,

        totalJobs:
          Number(
            data.totalJobs ??
              data.total_jobs ??
              0
          ) || 0,
      });
    } catch (error) {
      console.error(
        "ADMIN STATS ERROR:",
        error
      );

      setStats(DEFAULT_STATS);

      setStatsError(
        error.response?.data?.message ||
          error.message ||
          "Failed to connect to admin backend"
      );
    } finally {
      setLoadingStats(false);
    }
  };

  // ===================================================
  // FETCH RECENT ACTIVITIES
  // ===================================================

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);

      const response = await axios.get(
        `${API_URL}/api/admin/recent-activities`
      );

      console.log(
        "ADMIN ACTIVITIES RESPONSE:",
        response.data
      );

      if (
        response.data &&
        Array.isArray(response.data.activities)
      ) {
        setActivities(
          response.data.activities
        );
      } else if (
        response.data &&
        Array.isArray(response.data.data)
      ) {
        setActivities(
          response.data.data
        );
      } else if (
        Array.isArray(response.data)
      ) {
        setActivities(response.data);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error(
        "ACTIVITIES ERROR:",
        error
      );

      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, []);

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = async () => {
    await Promise.all([
      fetchStats(),
      fetchActivities(),
    ]);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="admin-dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-dashboard-header">

        <div className="admin-dashboard-heading">

          <div className="admin-dashboard-heading-icon">
            <FaChartLine />
          </div>

          <div>
            <h1>Admin Dashboard</h1>

            <p>
              Manage users, jobs, and platform
              activity from one place.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="admin-dashboard-refresh"
          onClick={handleRefresh}
          disabled={
            loadingStats ||
            loadingActivities
          }
        >
          <FaSyncAlt
            className={
              loadingStats ||
              loadingActivities
                ? "refresh-spinning"
                : ""
            }
          />

          {loadingStats ||
          loadingActivities
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </header>

      {/* =================================================
          ERROR
      ================================================= */}

      {statsError && (
        <div className="admin-dashboard-error">

          <div>
            <strong>
              Unable to load dashboard statistics
            </strong>

            <p>{statsError}</p>
          </div>

          <button
            type="button"
            onClick={fetchStats}
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="admin-stat-grid">

        {/* TOTAL USERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-top">

            <div className="admin-stat-icon users">
              <FaUsers />
            </div>

            <span className="admin-stat-label">
              USERS
            </span>

          </div>

          <div className="admin-stat-value">
            {loadingStats
              ? "..."
              : stats.totalUsers}
          </div>

          <div className="admin-stat-description">
            Registered users
          </div>

        </div>

        {/* JOB SEEKERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-top">

            <div className="admin-stat-icon seekers">
              <FaUserTie />
            </div>

            <span className="admin-stat-label">
              JOB SEEKERS
            </span>

          </div>

          <div className="admin-stat-value">
            {loadingStats
              ? "..."
              : stats.jobSeekers}
          </div>

          <div className="admin-stat-description">
            Active job seekers
          </div>

        </div>

        {/* JOB HOLDERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-top">

            <div className="admin-stat-icon holders">
              <FaBriefcase />
            </div>

            <span className="admin-stat-label">
              EMPLOYERS
            </span>

          </div>

          <div className="admin-stat-value">
            {loadingStats
              ? "..."
              : stats.jobHolders}
          </div>

          <div className="admin-stat-description">
            Job holders
          </div>

        </div>

        {/* TOTAL JOBS */}

        <div className="admin-stat-card">

          <div className="admin-stat-top">

            <div className="admin-stat-icon jobs">
              <FaClipboardList />
            </div>

            <span className="admin-stat-label">
              JOBS
            </span>

          </div>

          <div className="admin-stat-value">
            {loadingStats
              ? "..."
              : stats.totalJobs}
          </div>

          <div className="admin-stat-description">
            Posted jobs
          </div>

        </div>

      </section>

      {/* =================================================
          MAIN DASHBOARD GRID
      ================================================= */}

      <section className="admin-dashboard-grid">

        {/* =================================================
            RECENT ACTIVITIES
        ================================================= */}

        <div className="admin-activity-card">

          <div className="admin-section-header">

            <div>
              <h2>Recent Activities</h2>

              <p>
                Latest activity across the platform
              </p>
            </div>

            <span className="admin-section-badge">
              Latest
            </span>

          </div>

          <div className="admin-activity-list">

            {loadingActivities ? (

              <div className="admin-activity-empty">
                <FaSyncAlt className="refresh-spinning" />

                <p>
                  Loading activities...
                </p>
              </div>

            ) : activities.length === 0 ? (

              <div className="admin-activity-empty">

                <div className="admin-empty-icon">
                  <FaFileAlt />
                </div>

                <h3>
                  No recent activities
                </h3>

                <p>
                  New platform activities
                  will appear here.
                </p>

              </div>

            ) : (

              activities.map(
                (item, index) => (

                  <div
                    className="admin-activity-item"
                    key={
                      item.id ||
                      `activity-${index}`
                    }
                  >

                    <div className="admin-activity-icon">
                      {item.title
                        ? String(item.title)
                            .charAt(0)
                            .toUpperCase()
                        : "A"}
                    </div>

                    <div className="admin-activity-details">

                      <h3>
                        {item.title ||
                          "Activity"}
                      </h3>

                      <p>
                        {item.description ||
                          "Platform activity"}
                      </p>

                    </div>

                    <span className="admin-activity-time">
                      {item.time ||
                        item.created_at ||
                        ""}
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="admin-quick-card">

          <div className="admin-section-header">

            <div>
              <h2>Quick Actions</h2>

              <p>
                Manage your platform
              </p>
            </div>

          </div>

          <div className="admin-quick-actions">

            <button
              type="button"
              onClick={() =>
                navigate("/manage-users")
              }
            >
              <span className="quick-icon users">
                <FaUsers />
              </span>

              <span>
                <strong>Manage Users</strong>
                <small>
                  View and manage accounts
                </small>
              </span>

              <FaArrowRight />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/manage-jobs")
              }
            >
              <span className="quick-icon jobs">
                <FaBriefcase />
              </span>

              <span>
                <strong>Manage Jobs</strong>
                <small>
                  Review posted jobs
                </small>
              </span>

              <FaArrowRight />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/reports")
              }
            >
              <span className="quick-icon reports">
                <FaChartLine />
              </span>

              <span>
                <strong>View Reports</strong>
                <small>
                  Check platform reports
                </small>
              </span>

              <FaArrowRight />
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;