import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaVideo,
  FaMapMarkerAlt,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaBriefcase,
  FaRedo,
} from "react-icons/fa";

import "./JobHolderInterviews.css";

const API_URL = "http://localhost:5000";

function JobHolderInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
  // FETCH JOB HOLDER INTERVIEWS
  // =====================================================

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Authentication token is required. Please login again.");
        setLoading(false);
        return;
      }

      console.log("Fetching Job Holder interviews...");

      const response = await axios.get(
        `${API_URL}/api/jobholder/interviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Job Holder interviews response:", response.data);

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data.interviews)) {
        data = response.data.interviews;
      } else if (Array.isArray(response.data.data)) {
        data = response.data.data;
      }

      setInterviews(data);
      setFilteredInterviews(data);
    } catch (err) {
      console.error(
        "JOB HOLDER INTERVIEWS FETCH ERROR:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setError(
          "Authentication token is missing or expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to view Job Holder interviews."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to fetch Job Holder interviews"
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
    fetchInterviews();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  useEffect(() => {
    let result = [...interviews];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((interview) => {
        const candidate =
          interview.applicant_name ||
          interview.applicantName ||
          interview.candidate_name ||
          interview.candidateName ||
          interview.name ||
          "";

        const job =
          interview.job_title ||
          interview.jobTitle ||
          interview.title ||
          "";

        const interviewer =
          interview.interviewer ||
          interview.interviewer_name ||
          "";

        return (
          String(candidate)
            .toLowerCase()
            .includes(searchValue) ||
          String(job)
            .toLowerCase()
            .includes(searchValue) ||
          String(interviewer)
            .toLowerCase()
            .includes(searchValue)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (interview) =>
          String(interview.status || "")
            .toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredInterviews(result);
  }, [search, statusFilter, interviews]);

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "completed" ||
      value === "approved" ||
      value === "selected"
    ) {
      return "jhi-status-success";
    }

    if (
      value === "cancelled" ||
      value === "canceled" ||
      value === "rejected"
    ) {
      return "jhi-status-danger";
    }

    if (
      value === "scheduled" ||
      value === "upcoming" ||
      value === "interview"
    ) {
      return "jhi-status-info";
    }

    return "jhi-status-pending";
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "Not available";
    }

    const value = String(time);

    if (
      value.toLowerCase().includes("am") ||
      value.toLowerCase().includes("pm")
    ) {
      return value;
    }

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    let hour = parseInt(parts[0], 10);
    const minute = parts[1];

    if (Number.isNaN(hour)) {
      return value;
    }

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${ampm}`;
  };

  // =====================================================
  // INTERVIEW TYPE
  // =====================================================

  const getInterviewType = (interview) => {
    return (
      interview.interview_type ||
      interview.interviewType ||
      interview.type ||
      "Online"
    );
  };

  // =====================================================
  // VIEW INTERVIEW
  // =====================================================

  const handleView = (interview) => {
    const candidate =
      interview.applicant_name ||
      interview.applicantName ||
      interview.candidate_name ||
      interview.candidateName ||
      "Candidate";

    const job =
      interview.job_title ||
      interview.jobTitle ||
      interview.title ||
      "Job";

    const date =
      interview.interview_date ||
      interview.interviewDate ||
      interview.date;

    const time =
      interview.interview_time ||
      interview.interviewTime ||
      interview.time;

    const interviewer =
      interview.interviewer ||
      interview.interviewer_name ||
      "Not assigned";

    const type = getInterviewType(interview);

    alert(
      `Interview Details\n\n` +
        `Candidate: ${candidate}\n\n` +
        `Job: ${job}\n\n` +
        `Date: ${formatDate(date)}\n\n` +
        `Time: ${formatTime(time)}\n\n` +
        `Type: ${type}\n\n` +
        `Interviewer: ${interviewer}`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="jhi-page">
        <div className="jhi-loading">
          <div className="jhi-spinner"></div>
          <p>Loading interviews...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="jhi-page">

      {/* HEADER */}
      <div className="jhi-header">
        <div className="jhi-heading">

          <div className="jhi-heading-icon">
            <FaCalendarAlt />
          </div>

          <div>
            <h1>Interviews</h1>

            <p>
              Schedule, monitor and manage candidate interviews.
            </p>
          </div>

        </div>

        <button
          className="jhi-refresh-btn"
          onClick={fetchInterviews}
          disabled={loading}
        >
          <FaRedo />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="jhi-error">
          <span>{error}</span>

          <button onClick={fetchInterviews}>
            <FaRedo />
            Retry
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="jhi-stats">

        <div className="jhi-stat-card">
          <div className="jhi-stat-icon total">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Total Interviews</span>
            <strong>{interviews.length}</strong>
          </div>
        </div>

        <div className="jhi-stat-card">
          <div className="jhi-stat-icon upcoming">
            <FaClock />
          </div>

          <div>
            <span>Upcoming</span>

            <strong>
              {
                interviews.filter((item) => {
                  const status = String(
                    item.status || ""
                  ).toLowerCase();

                  return (
                    status === "scheduled" ||
                    status === "upcoming"
                  );
                }).length
              }
            </strong>
          </div>
        </div>

        <div className="jhi-stat-card">
          <div className="jhi-stat-icon completed">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>

            <strong>
              {
                interviews.filter(
                  (item) =>
                    String(item.status || "").toLowerCase() ===
                    "completed"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="jhi-stat-card">
          <div className="jhi-stat-icon cancelled">
            <FaTimesCircle />
          </div>

          <div>
            <span>Cancelled</span>

            <strong>
              {
                interviews.filter((item) => {
                  const status = String(
                    item.status || ""
                  ).toLowerCase();

                  return (
                    status === "cancelled" ||
                    status === "canceled"
                  );
                }).length
              }
            </strong>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}
      <div className="jhi-filter-bar">

        <div className="jhi-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Search candidate, job or interviewer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="jhi-status-filter">
          <FaFilter />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      {/* RESULTS */}
      <div className="jhi-results">
        Showing{" "}
        <strong>{filteredInterviews.length}</strong>{" "}
        interviews
      </div>

      {/* EMPTY */}
      {filteredInterviews.length === 0 ? (
        <div className="jhi-empty">

          <div className="jhi-empty-icon">
            <FaCalendarAlt />
          </div>

          <h2>No Interviews Found</h2>

          <p>
            There are currently no interviews matching
            your search or filter.
          </p>

        </div>
      ) : (

        <div className="jhi-table-container">

          <table className="jhi-table">

            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Date & Time</th>
                <th>Interview Type</th>
                <th>Interviewer</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredInterviews.map(
                (interview, index) => {

                  const candidate =
                    interview.applicant_name ||
                    interview.applicantName ||
                    interview.candidate_name ||
                    interview.candidateName ||
                    interview.name ||
                    "Candidate";

                  const job =
                    interview.job_title ||
                    interview.jobTitle ||
                    interview.title ||
                    "Job";

                  const interviewer =
                    interview.interviewer ||
                    interview.interviewer_name ||
                    "Not assigned";

                  const date =
                    interview.interview_date ||
                    interview.interviewDate ||
                    interview.date;

                  const time =
                    interview.interview_time ||
                    interview.interviewTime ||
                    interview.time;

                  const status =
                    interview.status ||
                    "Scheduled";

                  const type =
                    getInterviewType(interview);

                  return (
                    <tr
                      key={
                        interview.id ||
                        interview.interview_id ||
                        index
                      }
                    >

                      {/* CANDIDATE */}
                      <td>
                        <div className="jhi-candidate">

                          <div className="jhi-avatar">
                            {String(candidate)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {candidate}
                            </strong>

                            <span>
                              Applicant
                            </span>
                          </div>

                        </div>
                      </td>

                      {/* JOB */}
                      <td>
                        <div className="jhi-job">
                          <FaBriefcase />
                          <span>{job}</span>
                        </div>
                      </td>

                      {/* DATE/TIME */}
                      <td>
                        <div className="jhi-datetime">

                          <span>
                            <FaCalendarAlt />
                            {formatDate(date)}
                          </span>

                          <span>
                            <FaClock />
                            {formatTime(time)}
                          </span>

                        </div>
                      </td>

                      {/* TYPE */}
                      <td>
                        <div className="jhi-type">

                          {String(type)
                            .toLowerCase()
                            .includes("online") ? (
                            <FaVideo />
                          ) : (
                            <FaMapMarkerAlt />
                          )}

                          <span>{type}</span>

                        </div>
                      </td>

                      {/* INTERVIEWER */}
                      <td>
                        <div className="jhi-interviewer">

                          <FaUsers />

                          <span>
                            {interviewer}
                          </span>

                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span
                          className={`jhi-status ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td>
                        <button
                          className="jhi-view-btn"
                          onClick={() =>
                            handleView(interview)
                          }
                        >
                          <FaEye />
                          View
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

export default JobHolderInterviews;