import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaVideo,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaPlus,
  FaStickyNote,
} from "react-icons/fa";

import "./ManagerInterviews.css";

const API_URL = "http://localhost:5000";

function ManagerInterviews() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // FETCH INTERVIEWS
  // =====================================================

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token is missing. Please login again."
        );
        setInterviews([]);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/manager/interviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setInterviews(
          Array.isArray(response.data.interviews)
            ? response.data.interviews
            : []
        );
      } else {
        setInterviews([]);
        setError(
          response.data.message ||
            "Failed to load interviews."
        );
      }
    } catch (err) {
      console.error(
        "FETCH MANAGER INTERVIEWS ERROR:",
        err
      );

      setInterviews([]);

      setError(
        err.response?.data?.message ||
          "Failed to load interviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // =====================================================
  // SCHEDULE INTERVIEW
  // =====================================================

  const handleScheduleInterview = () => {
    navigate("/schedule-interview");
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) return "-";

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return time;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return time;
    }

    const suffix = hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHour}:${minutes} ${suffix}`;
  };

  // =====================================================
  // DATA HELPERS
  // =====================================================

  const getMeetingLink = (interview) => {
    return (
      interview.meeting_link ||
      interview.meetingLink ||
      interview.video_link ||
      interview.videoLink ||
      interview.interview_link ||
      interview.interviewLink ||
      ""
    );
  };

  const getInterviewType = (interview) => {
    return (
      interview.interview_type ||
      interview.interviewType ||
      "Interview"
    );
  };

  const getLocation = (interview) => {
    return (
      interview.location ||
      interview.interview_location ||
      interview.interviewLocation ||
      "-"
    );
  };

  const getInterviewStatus = (interview) => {
    return (
      interview.interview_status ||
      interview.interviewStatus ||
      interview.status ||
      "scheduled"
    );
  };

  const getApplicationStatus = (interview) => {
    return (
      interview.application_status ||
      interview.applicationStatus ||
      "pending"
    );
  };

  const getNormalizedInterviewStatus = (interview) => {
    return String(getInterviewStatus(interview))
      .trim()
      .toLowerCase();
  };

  const getNormalizedApplicationStatus = (interview) => {
    return String(getApplicationStatus(interview))
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const isCompleted = (interview) =>
    getNormalizedInterviewStatus(interview) ===
    "completed";

  const isSelected = (interview) =>
    getNormalizedApplicationStatus(interview) ===
    "selected";

  const isRejected = (interview) =>
    getNormalizedApplicationStatus(interview) ===
    "rejected";

  // =====================================================
  // FILTERED INTERVIEWS
  // =====================================================

  const filteredInterviews = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return interviews.filter((interview) => {
      const interviewStatus =
        getNormalizedInterviewStatus(interview);

      const applicationStatus =
        getNormalizedApplicationStatus(interview);

      let matchesStatus = true;

      if (statusFilter === "scheduled") {
        matchesStatus =
          interviewStatus !== "completed" &&
          applicationStatus !== "selected" &&
          applicationStatus !== "rejected";
      }

      if (statusFilter === "completed") {
        matchesStatus =
          interviewStatus === "completed" &&
          applicationStatus !== "selected" &&
          applicationStatus !== "rejected";
      }

      if (statusFilter === "selected") {
        matchesStatus =
          applicationStatus === "selected";
      }

      if (statusFilter === "rejected") {
        matchesStatus =
          applicationStatus === "rejected";
      }

      const candidate = String(
        interview.applicant_name || ""
      ).toLowerCase();

      const email = String(
        interview.email || ""
      ).toLowerCase();

      const jobTitle = String(
        interview.job_title || ""
      ).toLowerCase();

      const company = String(
        interview.company_name || ""
      ).toLowerCase();

      return (
        matchesStatus &&
        (
          !search ||
          candidate.includes(search) ||
          email.includes(search) ||
          jobTitle.includes(search) ||
          company.includes(search)
        )
      );
    });
  }, [
    interviews,
    searchTerm,
    statusFilter,
  ]);

  // =====================================================
  // COUNTS
  // =====================================================

  const totalCount = interviews.length;

  const scheduledCount = interviews.filter(
    (interview) => {
      const interviewStatus =
        getNormalizedInterviewStatus(interview);

      const applicationStatus =
        getNormalizedApplicationStatus(interview);

      return (
        interviewStatus !== "completed" &&
        applicationStatus !== "selected" &&
        applicationStatus !== "rejected"
      );
    }
  ).length;

  const completedCount = interviews.filter(
    (interview) => {
      return (
        getNormalizedInterviewStatus(interview) ===
          "completed" &&
        getNormalizedApplicationStatus(interview) !==
          "selected" &&
        getNormalizedApplicationStatus(interview) !==
          "rejected"
      );
    }
  ).length;

  const selectedCount = interviews.filter(
    (interview) =>
      getNormalizedApplicationStatus(interview) ===
      "selected"
  ).length;

  const rejectedCount = interviews.filter(
    (interview) =>
      getNormalizedApplicationStatus(interview) ===
      "rejected"
  ).length;

  // =====================================================
  // OPEN MEETING
  // =====================================================

  const handleOpenMeeting = (interview) => {
    const meetingLink =
      getMeetingLink(interview);

    if (!meetingLink) {
      alert("Meeting link is not available.");
      return;
    }

    window.open(
      meetingLink,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // COMPLETE INTERVIEW
  // =====================================================

  const handleCompleteInterview = async (
    interviewId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this interview as completed?"
    );

    if (!confirmed) return;

    try {
      setProcessing(
        `complete-${interviewId}`
      );

      const token = getToken();

      if (!token) {
        alert(
          "Authentication token is missing. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/manager/interviews/${interviewId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchInterviews();
      } else {
        alert(
          response.data.message ||
            "Failed to complete interview."
        );
      }
    } catch (err) {
      console.error(
        "COMPLETE INTERVIEW ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to complete interview."
      );
    } finally {
      setProcessing(null);
    }
  };

  // =====================================================
  // SELECT CANDIDATE
  // =====================================================

  const handleSelectCandidate = async (
    applicationId
  ) => {
    if (!applicationId) {
      alert("Application ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to select this candidate?"
    );

    if (!confirmed) return;

    try {
      setProcessing(
        `select-${applicationId}`
      );

      const token = getToken();

      if (!token) {
        alert(
          "Authentication token is missing. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/manager/applications/${applicationId}/select`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchInterviews();
      } else {
        alert(
          response.data.message ||
            "Failed to select candidate."
        );
      }
    } catch (err) {
      console.error(
        "SELECT CANDIDATE ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to select candidate."
      );
    } finally {
      setProcessing(null);
    }
  };

  // =====================================================
  // REJECT CANDIDATE
  // =====================================================

  const handleRejectCandidate = async (
    applicationId
  ) => {
    if (!applicationId) {
      alert("Application ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject this candidate?"
    );

    if (!confirmed) return;

    try {
      setProcessing(
        `reject-${applicationId}`
      );

      const token = getToken();

      if (!token) {
        alert(
          "Authentication token is missing. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/manager/applications/${applicationId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchInterviews();
      } else {
        alert(
          response.data.message ||
            "Failed to reject candidate."
        );
      }
    } catch (err) {
      console.error(
        "REJECT CANDIDATE ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to reject candidate."
      );
    } finally {
      setProcessing(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="manager-interviews-loading">
        <FaSpinner className="spin" />

        <span>
          Loading interviews...
        </span>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="manager-interviews-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="manager-interviews-header">
        <div className="manager-interviews-header-content">

          <div>
            <span className="manager-page-eyebrow">
              Recruitment Management
            </span>

            <h1>Interviews</h1>

            <p>
              Manage job interviews, review candidates,
              and make hiring decisions.
            </p>
          </div>

          <button
            type="button"
            className="schedule-interview-btn"
            onClick={handleScheduleInterview}
          >
            <FaPlus />
            Schedule Interview
          </button>

        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="manager-interviews-error">

          <div>
            <strong>
              Unable to load interviews
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={fetchInterviews}
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="interview-stats">

        <div className="interview-stat-card">
          <div className="interview-stat-icon total">
            <FaBriefcase />
          </div>

          <div>
            <span>Total Interviews</span>
            <strong>{totalCount}</strong>
          </div>
        </div>

        <div className="interview-stat-card">
          <div className="interview-stat-icon scheduled">
            <FaCalendarAlt />
          </div>

          <div>
            <span>Scheduled</span>
            <strong>{scheduledCount}</strong>
          </div>
        </div>

        <div className="interview-stat-card">
          <div className="interview-stat-icon completed">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <div className="interview-stat-card">
          <div className="interview-stat-icon selected">
            <FaCheckCircle />
          </div>

          <div>
            <span>Selected</span>
            <strong>{selectedCount}</strong>
          </div>
        </div>

        <div className="interview-stat-card">
          <div className="interview-stat-icon rejected">
            <FaTimesCircle />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

      </div>

      {/* =================================================
          FILTER AREA
      ================================================= */}

      <div className="interview-filter-section">

        <div className="interview-filter-top">

          <div>
            <h2>Job Interviews</h2>

            <p>
              Showing{" "}
              <strong>
                {filteredInterviews.length}
              </strong>{" "}
              of{" "}
              <strong>{totalCount}</strong>{" "}
              interviews
            </p>
          </div>

          <div className="filter-label">
            <FaFilter />
            Filter Interviews
          </div>

        </div>

        <div className="interview-filter-controls">

          <div className="interview-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search job, candidate, email..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <div className="interview-status-select">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Interviews
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="selected">
                Selected
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

            <FaChevronDown />
          </div>

        </div>

        <div className="interview-quick-filters">

          <button
            type="button"
            className={
              statusFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("all")
            }
          >
            All
            <span>{totalCount}</span>
          </button>

          <button
            type="button"
            className={
              statusFilter === "scheduled"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("scheduled")
            }
          >
            Scheduled
            <span>{scheduledCount}</span>
          </button>

          <button
            type="button"
            className={
              statusFilter === "completed"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("completed")
            }
          >
            Completed
            <span>{completedCount}</span>
          </button>

          <button
            type="button"
            className={
              statusFilter === "selected"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("selected")
            }
          >
            Selected
            <span>{selectedCount}</span>
          </button>

          <button
            type="button"
            className={
              statusFilter === "rejected"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("rejected")
            }
          >
            Rejected
            <span>{rejectedCount}</span>
          </button>

        </div>

      </div>

      {/* =================================================
          INTERVIEW LIST
      ================================================= */}

      {filteredInterviews.length === 0 ? (

        <div className="interviews-empty">

          <div className="interviews-empty-icon">
            <FaBriefcase />
          </div>

          <h3>No interviews found</h3>

          <p>
            There are no interviews matching your
            current search or filter.
          </p>

          {(searchTerm ||
            statusFilter !== "all") ? (
            <button
              type="button"
              className="clear-interview-filter"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </button>
          ) : (
            <button
              type="button"
              className="empty-schedule-interview"
              onClick={handleScheduleInterview}
            >
              <FaCalendarAlt />
              Schedule Interview
            </button>
          )}

        </div>

      ) : (

        <div className="job-interviews-list">

          {filteredInterviews.map((interview) => {

            const interviewStatus =
              getNormalizedInterviewStatus(
                interview
              );

            const applicationStatus =
              getNormalizedApplicationStatus(
                interview
              );

            const completed =
              interviewStatus === "completed";

            const selected =
              applicationStatus === "selected";

            const rejected =
              applicationStatus === "rejected";

            const meetingLink =
              getMeetingLink(interview);

            const interviewType =
              getInterviewType(interview);

            const location =
              getLocation(interview);

            const isOnline =
              String(interviewType)
                .toLowerCase()
                .includes("online") ||
              String(interviewType)
                .toLowerCase()
                .includes("video");

            const processingComplete =
              processing ===
              `complete-${interview.id}`;

            const processingSelect =
              processing ===
              `select-${interview.application_id}`;

            const processingReject =
              processing ===
              `reject-${interview.application_id}`;

            return (
              <article
                className="job-interview-card"
                key={interview.id}
              >

                {/* =================================================
                    JOB HEADER
                ================================================= */}

                <div className="job-interview-main">

                  <div className="job-interview-title-section">

                    <div className="job-interview-icon">
                      <FaBriefcase />
                    </div>

                    <div className="job-interview-title">

                      <span>
                        INTERVIEW FOR
                      </span>

                      <h2>
                        {interview.job_title ||
                          "Job Position"}
                      </h2>

                      <p>
                        <FaBriefcase />

                        {interview.company_name ||
                          "Company not available"}
                      </p>

                    </div>

                  </div>

                  <div className="job-interview-statuses">

                    <span
                      className={`application-badge ${applicationStatus}`}
                    >
                      {applicationStatus}
                    </span>

                    <span
                      className={`interview-badge ${interviewStatus}`}
                    >
                      {interviewStatus}
                    </span>

                  </div>

                </div>

                {/* =================================================
                    INTERVIEW DATE / TIME
                ================================================= */}

                <div className="job-interview-schedule">

                  <div className="schedule-box">

                    <div className="schedule-icon">
                      <FaCalendarAlt />
                    </div>

                    <div>
                      <span>Interview Date</span>

                      <strong>
                        {formatDate(
                          interview.interview_date
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="schedule-box">

                    <div className="schedule-icon">
                      <FaClock />
                    </div>

                    <div>
                      <span>Interview Time</span>

                      <strong>
                        {formatTime(
                          interview.interview_time
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="schedule-box">

                    <div className="schedule-icon">

                      {isOnline ? (
                        <FaVideo />
                      ) : (
                        <FaMapMarkerAlt />
                      )}

                    </div>

                    <div>
                      <span>Interview Type</span>

                      <strong>
                        {interviewType}
                      </strong>

                      {!isOnline &&
                        location !== "-" && (
                          <small>
                            {location}
                          </small>
                        )}
                    </div>

                  </div>

                </div>

                {/* =================================================
                    CANDIDATE SECTION
                ================================================= */}

                <div className="job-interview-details">

                  <div className="candidate-interview-section">

                    <div className="section-title">
                      <FaUser />
                      <span>Candidate</span>
                    </div>

                    <div className="candidate-interview-info">

                      <div className="candidate-large-avatar">
                        {(
                          interview.applicant_name ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="candidate-data">

                        <h3>
                          {interview.applicant_name ||
                            "Candidate"}
                        </h3>

                        <p>
                          <FaEnvelope />

                          {interview.email ||
                            "Email not available"}
                        </p>

                        {interview.phone && (
                          <p>
                            <FaPhone />
                            {interview.phone}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      APPLICATION
                  ================================================= */}

                  <div className="application-information">

                    <div className="section-title">
                      <FaBriefcase />
                      <span>Application</span>
                    </div>

                    <div className="application-id-box">

                      <span>
                        Application ID
                      </span>

                      <strong>
                        {interview.application_id ||
                          interview.id ||
                          "-"}
                      </strong>

                    </div>

                    {interview.interviewer && (
                      <div className="interviewer-box">

                        <span>
                          Interviewer
                        </span>

                        <strong>
                          {interview.interviewer}
                        </strong>

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      NOTES
                  ================================================= */}

                  {interview.notes && (
                    <div className="interview-notes-box">

                      <div className="section-title">
                        <FaStickyNote />
                        <span>
                          Interview Notes
                        </span>
                      </div>

                      <p>
                        {interview.notes}
                      </p>

                    </div>
                  )}

                </div>

                {/* =================================================
                    ONLINE MEETING
                ================================================= */}

                {isOnline &&
                  meetingLink &&
                  !completed &&
                  !selected &&
                  !rejected && (
                    <div className="job-meeting-bar">

                      <div className="job-meeting-info">

                        <div className="job-meeting-icon">
                          <FaVideo />
                        </div>

                        <div>
                          <strong>
                            Online Interview
                          </strong>

                          <span>
                            Meeting link is ready
                          </span>
                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenMeeting(
                            interview
                          )
                        }
                      >
                        <FaExternalLinkAlt />
                        Join Interview
                      </button>

                    </div>
                  )}

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="job-interview-footer">

                  <div className="job-interview-result">

                    {selected && (
                      <span className="result selected">
                        <FaCheckCircle />
                        Candidate Selected
                      </span>
                    )}

                    {rejected && (
                      <span className="result rejected">
                        <FaTimesCircle />
                        Candidate Rejected
                      </span>
                    )}

                    {completed &&
                      !selected &&
                      !rejected && (
                        <span className="result completed">
                          <FaCheckCircle />
                          Interview Completed
                        </span>
                      )}

                    {!completed &&
                      !selected &&
                      !rejected && (
                        <span className="result scheduled">
                          <FaCalendarAlt />
                          Interview Scheduled
                        </span>
                      )}

                  </div>

                  <div className="job-interview-actions">

                    {/* JOIN */}

                    {isOnline &&
                      meetingLink &&
                      !completed &&
                      !selected &&
                      !rejected && (
                        <button
                          type="button"
                          className="interview-action join"
                          onClick={() =>
                            handleOpenMeeting(
                              interview
                            )
                          }
                        >
                          <FaVideo />
                          Attend
                        </button>
                      )}

                    {/* COMPLETE */}

                    {!completed &&
                      !selected &&
                      !rejected && (
                        <button
                          type="button"
                          className="interview-action complete"
                          disabled={
                            processingComplete
                          }
                          onClick={() =>
                            handleCompleteInterview(
                              interview.id
                            )
                          }
                        >
                          {processingComplete ? (
                            <>
                              <FaSpinner className="spin" />
                              Updating
                            </>
                          ) : (
                            <>
                              <FaCheckCircle />
                              Mark Completed
                            </>
                          )}
                        </button>
                      )}

                    {/* SELECT */}

                    {completed &&
                      !selected &&
                      !rejected && (
                        <>
                          <button
                            type="button"
                            className="interview-action select"
                            disabled={
                              processingSelect
                            }
                            onClick={() =>
                              handleSelectCandidate(
                                interview.application_id
                              )
                            }
                          >
                            {processingSelect ? (
                              <>
                                <FaSpinner className="spin" />
                                Selecting
                              </>
                            ) : (
                              <>
                                <FaCheckCircle />
                                Select Candidate
                              </>
                            )}
                          </button>

                          {/* REJECT */}

                          <button
                            type="button"
                            className="interview-action reject"
                            disabled={
                              processingReject
                            }
                            onClick={() =>
                              handleRejectCandidate(
                                interview.application_id
                              )
                            }
                          >
                            {processingReject ? (
                              <>
                                <FaSpinner className="spin" />
                                Rejecting
                              </>
                            ) : (
                              <>
                                <FaTimesCircle />
                                Reject
                              </>
                            )}
                          </button>
                        </>
                      )}

                  </div>

                </div>

              </article>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default ManagerInterviews;