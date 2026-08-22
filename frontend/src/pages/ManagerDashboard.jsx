import React, { useEffect, useState } from "react";
import "./ManagerDashboard.css";
import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaUsers,
  FaCalendarCheck,
  FaUserTie,
  FaCheckCircle,
  FaPlus,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

function ManagerDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    applicants: 0,
    interviews: 0,
    recruiters: 0,
    approvedJobs: 0,
    openJobs: 0,
  });

  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // MANAGER USER
  // =====================================================

  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("USER STORAGE ERROR:", error);
      return null;
    }
  };

  const manager = getStoredUser();

  // =====================================================
  // LOGOUT / CLEAR SESSION
  // =====================================================

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");

    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    navigate("/login", { replace: true });
  };

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      console.log(
        "Manager Dashboard token exists:",
        Boolean(token)
      );

      if (!token) {
        setError(
          "Authentication token is missing. Please login again."
        );

        setLoading(false);

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);

        return;
      }

      // =================================================
      // API REQUEST
      // =================================================

      const response = await fetch(
        `${API_URL}/api/manager/dashboard`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // =================================================
      // READ RESPONSE
      // =================================================

      let data = {};

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "Invalid JSON response:",
          jsonError
        );
      }

      console.log(
        "Manager Dashboard Status:",
        response.status
      );

      console.log(
        "Manager Dashboard Response:",
        data
      );

      // =================================================
      // AUTHENTICATION ERROR
      // =================================================

      if (response.status === 401) {
        setError(
          data.message ||
            "Your session is invalid or expired. Please login again."
        );

        clearSession();

        return;
      }

      // =================================================
      // ROLE ERROR
      // =================================================

      if (response.status === 403) {
        setError(
          data.message ||
            "You do not have permission to access the manager dashboard."
        );

        return;
      }

      // =================================================
      // OTHER BACKEND ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load manager dashboard"
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Failed to load manager dashboard"
        );
      }

      // =================================================
      // SET DASHBOARD STATS
      // =================================================

      setDashboardData({
        totalJobs:
          Number(data.stats?.totalJobs) || 0,

        applicants:
          Number(data.stats?.applicants) || 0,

        interviews:
          Number(data.stats?.interviews) || 0,

        recruiters:
          Number(data.stats?.recruiters) || 0,

        approvedJobs:
          Number(data.stats?.approvedJobs) || 0,

        openJobs:
          Number(data.stats?.openJobs) || 0,
      });

      // =================================================
      // RECENT APPLICANTS
      // =================================================

      setRecentApplicants(
        Array.isArray(data.recentApplicants)
          ? data.recentApplicants
          : []
      );

    } catch (error) {
      console.error(
        "MANAGER DASHBOARD ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard data."
      );

      setRecentApplicants([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // DASHBOARD STATS
  // REPORT CARD REMOVED
  // =====================================================

  const stats = [
    {
      title: "Total Jobs",
      value: dashboardData.totalJobs,
      icon: <FaBriefcase />,
      color: "blue",
    },

    {
      title: "Applicants",
      value: dashboardData.applicants,
      icon: <FaUsers />,
      color: "purple",
    },

    {
      title: "Interviews",
      value: dashboardData.interviews,
      icon: <FaCalendarCheck />,
      color: "orange",
    },

    {
      title: "Recruiters",
      value: dashboardData.recruiters,
      icon: <FaUserTie />,
      color: "green",
    },

    {
      title: "Approved Jobs",
      value: dashboardData.approvedJobs,
      icon: <FaCheckCircle />,
      color: "teal",
    },
  ];

  // =====================================================
  // APPLICANT NAME
  // =====================================================

  const getApplicantName = (applicant) => {
    return (
      applicant.applicant_name ||
      applicant.name ||
      applicant.fullname ||
      applicant.full_name ||
      applicant.username ||
      "Applicant"
    );
  };

  // =====================================================
  // APPLICANT POSITION
  // =====================================================

  const getApplicantPosition = (applicant) => {
    return (
      applicant.job_title ||
      applicant.position ||
      applicant.title ||
      "N/A"
    );
  };

  // =====================================================
  // APPLICANT STATUS
  // =====================================================

  const getApplicantStatus = (applicant) => {
    return (
      applicant.status ||
      applicant.application_status ||
      "Pending"
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="manager-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="header">

        <div>
          <h1>Manager Dashboard</h1>

          <p>
            Manage jobs, applicants,
            recruiters, and interviews.
          </p>
        </div>

        <button
          className="create-job-btn"
          onClick={() =>
            navigate("/create-job")
          }
        >
          <FaPlus />

          <span>
            Create Job
          </span>
        </button>

      </div>

      {/* =================================================
          MANAGER INFORMATION
      ================================================= */}

      {manager && (
        <div className="manager-welcome">
          Welcome{" "}

          <strong>
            {manager.fullname ||
              manager.name ||
              "Manager"}
          </strong>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-error">

          <div>
            {error}
          </div>

          <button
            onClick={fetchDashboard}
          >
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="card-container">

        {stats.map((item, index) => (
          <div
            className="card"
            key={index}
          >

            <div
              className={`icon ${item.color}`}
            >
              {item.icon}
            </div>

            <div className="card-content">

              <h2>
                {loading
                  ? "..."
                  : item.value}
              </h2>

              <p>
                {item.title}
              </p>

            </div>

          </div>
        ))}

      </div>

      {/* =================================================
          RECENT APPLICANTS
      ================================================= */}

      <div className="table-section">

        <div className="table-header">

          <div>

            <h2>
              Recent Applicants
            </h2>

            <p>
              Latest job applications
            </p>

          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate("/applicants")
            }
          >
            View All
          </button>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="3"
                    className="loading-row"
                  >
                    Loading applicants...
                  </td>

                </tr>

              ) : recentApplicants.length > 0 ? (

                recentApplicants.map(
                  (applicant, index) => {

                    const applicantName =
                      getApplicantName(
                        applicant
                      );

                    const applicantPosition =
                      getApplicantPosition(
                        applicant
                      );

                    const applicantStatus =
                      getApplicantStatus(
                        applicant
                      );

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

                          <div className="applicant-info">

                            <div className="applicant-avatar">

                              {applicantName
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <span>
                              {applicantName}
                            </span>

                          </div>

                        </td>

                        {/* POSITION */}

                        <td>
                          {applicantPosition}
                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`status ${String(
                              applicantStatus
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {applicantStatus}
                          </span>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="3"
                    className="empty-row"
                  >
                    No applicants available
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default ManagerDashboard;