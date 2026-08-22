import "./Reports.css";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  FaUsers,
  FaBriefcase,
  FaUserTie,
  FaUserCheck,
  FaClipboardList,
  FaCalendarCheck,
  FaSyncAlt,
  FaChartBar,
  FaChartPie,
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


// =====================================================
// API CONFIG
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// DEFAULT STATS
// =====================================================

const DEFAULT_STATS = {
  totalUsers: 0,
  totalJobs: 0,
  totalApplications: 0,
  totalInterviews: 0,
  jobSeekers: 0,
  jobHolders: 0,
  admins: 0,
};


// =====================================================
// REPORTS
// =====================================================

function Reports() {
  // ===================================================
  // STATE
  // ===================================================

  const [stats, setStats] = useState(DEFAULT_STATS);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());


  // ===================================================
  // FETCH REPORTS
  // ===================================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Fetching admin reports:",
        `${API_URL}/api/admin/stats`
      );

      const response = await axios.get(
        `${API_URL}/api/admin/stats`
      );

      console.log(
        "ADMIN REPORT RESPONSE:",
        response.data
      );

      // =================================================
      // HANDLE DIFFERENT RESPONSE STRUCTURES
      // =================================================

      if (response.data?.success) {
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

          totalJobs:
            Number(
              data.totalJobs ??
              data.total_jobs ??
              0
            ) || 0,

          totalApplications:
            Number(
              data.totalApplications ??
              data.total_applications ??
              0
            ) || 0,

          totalInterviews:
            Number(
              data.totalInterviews ??
              data.total_interviews ??
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

          admins:
            Number(
              data.admins ??
              data.totalAdmins ??
              data.total_admins ??
              0
            ) || 0,
        });
      } else {
        setStats(DEFAULT_STATS);

        setError(
          response.data?.message ||
            "Failed to load reports"
        );
      }
    } catch (err) {
      console.error(
        "REPORTS FETCH ERROR:",
        err
      );

      setStats(DEFAULT_STATS);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  };


  // ===================================================
  // INITIAL LOAD + CLOCK
  // ===================================================

  useEffect(() => {
    fetchReports();

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);


  // ===================================================
  // DATE
  // ===================================================

  const formattedDate =
    currentDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }
    );


  // ===================================================
  // TIME
  // ===================================================

  const formattedTime =
    currentDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }
    );


  // ===================================================
  // BAR CHART DATA
  // ===================================================

  const portalData = [
    {
      name: "Users",
      value: stats.totalUsers,
    },
    {
      name: "Jobs",
      value: stats.totalJobs,
    },
    {
      name: "Applications",
      value: stats.totalApplications,
    },
    {
      name: "Interviews",
      value: stats.totalInterviews,
    },
  ];


  // ===================================================
  // ROLE CHART DATA
  // ===================================================

  const roleData = [
    {
      name: "Job Seekers",
      value: stats.jobSeekers,
    },
    {
      name: "Job Holders",
      value: stats.jobHolders,
    },
    {
      name: "Admins",
      value: stats.admins,
    },
  ];


  // ===================================================
  // REPORT CARD
  // ===================================================

  const ReportCard = ({
    icon,
    title,
    value,
    className = "",
  }) => {
    return (
      <div
        className={`report-card ${className}`}
      >
        <div className="report-card-icon">
          {icon}
        </div>

        <div className="report-card-content">
          <h3>{title}</h3>

          <strong>
            {loading ? "..." : value}
          </strong>
        </div>
      </div>
    );
  };


  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="reports-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <div>
          <h1>
            Reports Dashboard
          </h1>

          <p>
            Welcome back, Admin.
          </p>
        </div>


        <div className="date-time-card">

          <div>
            <FaClipboardList />

            <span>
              {formattedDate}
            </span>
          </div>


          <div>
            <FaCalendarCheck />

            <span>
              {formattedTime}
            </span>
          </div>

        </div>

      </div>


      {/* =================================================
          REPORT INFORMATION
      ================================================= */}

      <div className="last-login-card">

        <div className="report-info">

          <h2>
            Report Statistics
          </h2>

          <p>
            Live statistics fetched from
            PostgreSQL backend.
          </p>

        </div>


        <button
          type="button"
          className="refresh-reports-btn"
          onClick={fetchReports}
          disabled={loading}
        >

          <FaSyncAlt
            className={
              loading
                ? "refresh-icon spinning"
                : "refresh-icon"
            }
          />

          {loading
            ? "Loading..."
            : "Refresh Reports"}

        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="reports-error">

          <strong>
            Backend Error:
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={fetchReports}
          >
            Try Again
          </button>

        </div>
      )}


      {/* =================================================
          REPORT CARDS
      ================================================= */}

      <div className="reports-grid">

        <ReportCard
          icon={<FaUsers />}
          title="Total Users"
          value={stats.totalUsers}
          className="users-card"
        />


        <ReportCard
          icon={<FaBriefcase />}
          title="Total Jobs"
          value={stats.totalJobs}
          className="jobs-card"
        />


        <ReportCard
          icon={<FaUserCheck />}
          title="Job Seekers"
          value={stats.jobSeekers}
          className="seekers-card"
        />


        <ReportCard
          icon={<FaUserTie />}
          title="Job Holders"
          value={stats.jobHolders}
          className="holders-card"
        />


        <ReportCard
          icon={<FaClipboardList />}
          title="Applications"
          value={stats.totalApplications}
          className="applications-card"
        />


        <ReportCard
          icon={<FaCalendarCheck />}
          title="Interviews"
          value={stats.totalInterviews}
          className="interviews-card"
        />

      </div>


      {/* =================================================
          CHARTS
      ================================================= */}

      <div className="charts-section">

        {/* ===============================================
            BAR CHART
        =============================================== */}

        <div className="chart-card">

          <div className="chart-header">

            <div>

              <h2>
                <FaChartBar />
                Platform Overview
              </h2>

              <p>
                Overall activity across the
                job portal
              </p>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <BarChart
                data={portalData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Count"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* ===============================================
            PIE CHART
        =============================================== */}

        <div className="chart-card">

          <div className="chart-header">

            <div>

              <h2>
                <FaChartPie />
                User Distribution
              </h2>

              <p>
                Distribution of registered
                users
              </p>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={350}
            >

              <PieChart>

                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >

                  {roleData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#2563eb",
                            "#16a34a",
                            "#dc2626",
                          ][index]
                        }
                      />
                    )
                  )}

                </Pie>


                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>


      {/* =================================================
          PLATFORM SUMMARY
      ================================================= */}

      <div className="reports-summary">

        <div className="summary-header">

          <div>

            <h2>
              Platform Summary
            </h2>

            <p>
              Current job portal statistics
            </p>

          </div>

        </div>


        <div className="summary-grid">

          <div className="summary-item">

            <span>
              Administrators
            </span>

            <strong>
              {loading
                ? "..."
                : stats.admins}
            </strong>

          </div>


          <div className="summary-item">

            <span>
              Job Seekers
            </span>

            <strong>
              {loading
                ? "..."
                : stats.jobSeekers}
            </strong>

          </div>


          <div className="summary-item">

            <span>
              Job Holders
            </span>

            <strong>
              {loading
                ? "..."
                : stats.jobHolders}
            </strong>

          </div>


          <div className="summary-item">

            <span>
              Total Jobs
            </span>

            <strong>
              {loading
                ? "..."
                : stats.totalJobs}
            </strong>

          </div>


          <div className="summary-item">

            <span>
              Applications
            </span>

            <strong>
              {loading
                ? "..."
                : stats.totalApplications}
            </strong>

          </div>


          <div className="summary-item">

            <span>
              Interviews
            </span>

            <strong>
              {loading
                ? "..."
                : stats.totalInterviews}
            </strong>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Reports;