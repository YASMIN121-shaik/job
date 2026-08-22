import React, { useEffect, useState } from "react";

import {
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaBuilding,
  FaEye,
  FaCheckCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

import "./MyInterviews.css";

const API_URL = "http://localhost:5000";

function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (err) {
      console.error(
        "Unable to read logged-in user:",
        err
      );

      return null;
    }
  };

  // =====================================================
  // FETCH INTERVIEWS
  // =====================================================

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const user = getUser();

      console.log("Logged-in user:", user);

      if (!user) {
        setInterviews([]);
        setError("User is not logged in.");
        return;
      }

      if (!user.email) {
        setInterviews([]);
        setError(
          "Logged-in user email was not found."
        );

        return;
      }

      const email = String(user.email).trim();

      console.log(
        "Fetching interviews for:",
        email
      );

      const response = await fetch(
        `${API_URL}/api/jobseeker/interviews?email=${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      console.log(
        "Interview API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch interviews."
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Failed to fetch interviews."
        );
      }

      const interviewData = Array.isArray(data)
        ? data
        : Array.isArray(data.interviews)
        ? data.interviews
        : [];

      setInterviews(interviewData);
    } catch (err) {
      console.error(
        "Fetch Interviews Error:",
        err
      );

      setError(
        err.message ||
          "Failed to fetch interviews."
      );

      setInterviews([]);
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
  // GET STATUS
  // =====================================================

  const getStatus = (interview) => {
    return (
      interview.status ||
      interview.interview_status ||
      "Scheduled"
    );
  };

  // =====================================================
  // GET DATE
  // =====================================================

  const getInterviewDate = (interview) => {
    return (
      interview.interview_date ||
      interview.date ||
      null
    );
  };

  // =====================================================
  // GET TIME
  // =====================================================

  const getInterviewTime = (interview) => {
    return (
      interview.interview_time ||
      interview.time ||
      null
    );
  };

  // =====================================================
  // GET TITLE
  // =====================================================

  const getInterviewTitle = (interview) => {
    return (
      interview.title ||
      interview.job_title ||
      interview.position ||
      interview.jobTitle ||
      "Interview"
    );
  };

  // =====================================================
  // GET COMPANY
  // =====================================================

  const getCompany = (interview) => {
    return (
      interview.company ||
      interview.company_name ||
      interview.companyName ||
      "Company"
    );
  };

  // =====================================================
  // GET INTERVIEW TYPE
  // =====================================================

  const getInterviewType = (interview) => {
    return (
      interview.type ||
      interview.interview_type ||
      interview.interviewType ||
      "Interview"
    );
  };

  // =====================================================
  // GET LOCATION
  // =====================================================

  const getLocation = (interview) => {
    return (
      interview.location ||
      interview.interview_location ||
      interview.interviewLocation ||
      "-"
    );
  };

  // =====================================================
  // GET INTERVIEWER
  // =====================================================

  const getInterviewer = (interview) => {
    return (
      interview.interviewer ||
      interview.interviewer_name ||
      interview.interviewerName ||
      "-"
    );
  };

  // =====================================================
  // GET MEETING LINK
  // =====================================================

  const getMeetingLink = (interview) => {
    return (
      interview.meeting_link ||
      interview.meetingLink ||
      interview.video_link ||
      interview.videoLink ||
      interview.interview_link ||
      interview.interviewLink ||
      interview.online_link ||
      interview.onlineLink ||
      ""
    );
  };

  // =====================================================
  // CHECK IF ONLINE INTERVIEW
  // =====================================================

  const isOnlineInterview = (interview) => {
    const type = String(
      getInterviewType(interview) || ""
    ).toLowerCase();

    return (
      type.includes("online") ||
      type.includes("video") ||
      type.includes("virtual") ||
      type.includes("zoom") ||
      type.includes("google meet")
    );
  };

  // =====================================================
  // CHECK IF COMPLETED
  // =====================================================

  const isCompleted = (interview) => {
    const status = String(
      getStatus(interview)
    )
      .trim()
      .toLowerCase();

    return (
      status === "completed" ||
      status === "attended"
    );
  };

  // =====================================================
  // CHECK IF CAN ATTEND
  // =====================================================

  const canAttendInterview = (interview) => {
    const status = String(
      getStatus(interview)
    )
      .trim()
      .toLowerCase();

    const meetingLink =
      getMeetingLink(interview);

    if (!meetingLink) {
      return false;
    }

    if (
      status === "completed" ||
      status === "attended" ||
      status === "cancelled" ||
      status === "canceled" ||
      status === "rejected"
    ) {
      return false;
    }

    return true;
  };

  // =====================================================
  // FILTER TABS
  // =====================================================

  const filteredInterviews =
    interviews.filter((interview) => {
      const status = String(
        getStatus(interview)
      )
        .trim()
        .toLowerCase();

      if (activeTab === "All") {
        return true;
      }

      if (activeTab === "Upcoming") {
        return (
          status === "scheduled" ||
          status === "upcoming" ||
          status === "interview scheduled"
        );
      }

      if (activeTab === "Completed") {
        return (
          status === "completed" ||
          status === "attended"
        );
      }

      return true;
    });

  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status) => {
    const normalizedStatus = String(
      status || ""
    )
      .trim()
      .toLowerCase();

    if (
      normalizedStatus === "completed" ||
      normalizedStatus === "attended"
    ) {
      return <FaCheckCircle />;
    }

    return <FaHourglassHalf />;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
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
  // GET DAY
  // =====================================================

  const getDay = (interview) => {
    if (interview.day) {
      return interview.day;
    }

    const date =
      getInterviewDate(interview);

    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.getDate();
  };

  // =====================================================
  // GET MONTH
  // =====================================================

  const getMonth = (interview) => {
    if (interview.month) {
      return interview.month;
    }

    const date =
      getInterviewDate(interview);

    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        month: "short",
      }
    );
  };

  // =====================================================
  // VIEW DETAILS
  // =====================================================

  const handleViewDetails = (interview) => {
    const date =
      getInterviewDate(interview);

    const time =
      getInterviewTime(interview);

    const type =
      getInterviewType(interview);

    const company =
      getCompany(interview);

    const interviewer =
      getInterviewer(interview);

    const location =
      getLocation(interview);

    const status =
      getStatus(interview);

    alert(
      `Interview: ${getInterviewTitle(
        interview
      )}\n\n` +
        `Company: ${company}\n` +
        `Date: ${formatDate(date)}\n` +
        `Time: ${time || "-"}\n` +
        `Type: ${type}\n` +
        `Location: ${location}\n` +
        `Interviewer: ${interviewer}\n` +
        `Status: ${status}`
    );
  };

  // =====================================================
  // ATTEND INTERVIEW
  // =====================================================

  const handleAttendInterview = (
    interview
  ) => {
    const meetingLink =
      getMeetingLink(interview);

    if (!meetingLink) {
      return;
    }

    let finalLink =
      meetingLink.trim();

    if (
      !finalLink.startsWith("http://") &&
      !finalLink.startsWith("https://")
    ) {
      finalLink = `https://${finalLink}`;
    }

    console.log(
      "Opening interview meeting:",
      finalLink
    );

    window.open(
      finalLink,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="my-interviews-page">

        <div className="my-interviews-header">

          <div>
            <h1>My Interviews</h1>

            <p>
              Manage your upcoming and completed
              interviews
            </p>
          </div>

        </div>

        <div className="no-interviews">

          <div className="no-interview-icon">
            <FaCalendarAlt />
          </div>

          <h3>
            Loading interviews...
          </h3>

          <p>
            Please wait while we load your
            interviews.
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
      <div className="my-interviews-page">

        <div className="my-interviews-header">

          <div>
            <h1>My Interviews</h1>

            <p>
              Manage your upcoming and completed
              interviews
            </p>
          </div>

        </div>

        <div className="no-interviews">

          <div className="no-interview-icon">
            <FaCalendarAlt />
          </div>

          <h3>
            Unable to load interviews
          </h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchInterviews}
            className="join-interview-btn"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="my-interviews-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="my-interviews-header">

        <div>

          <h1>
            My Interviews
          </h1>

          <p>
            Manage your upcoming and completed
            interviews
          </p>

        </div>

        <div className="interview-count">

          <FaCalendarAlt />

          <span>
            {interviews.length} Interviews
          </span>

        </div>

      </div>

      {/* =================================================
          TABS
      ================================================= */}

      <div className="interview-tabs">

        <button
          type="button"
          className={
            activeTab === "All"
              ? "interview-tab active"
              : "interview-tab"
          }
          onClick={() =>
            setActiveTab("All")
          }
        >
          All
        </button>

        <button
          type="button"
          className={
            activeTab === "Upcoming"
              ? "interview-tab active"
              : "interview-tab"
          }
          onClick={() =>
            setActiveTab("Upcoming")
          }
        >
          Upcoming
        </button>

        <button
          type="button"
          className={
            activeTab === "Completed"
              ? "interview-tab active"
              : "interview-tab"
          }
          onClick={() =>
            setActiveTab("Completed")
          }
        >
          Completed
        </button>

      </div>

      {/* =================================================
          INTERVIEW LIST
      ================================================= */}

      <div className="my-interviews-list">

        {filteredInterviews.length > 0 ? (

          filteredInterviews.map(
            (interview, index) => {

              const status =
                getStatus(interview);

              const normalizedStatus =
                String(status)
                  .toLowerCase()
                  .replace(/\s+/g, "-");

              const interviewDate =
                getInterviewDate(
                  interview
                );

              const interviewTime =
                getInterviewTime(
                  interview
                );

              const interviewType =
                getInterviewType(
                  interview
                );

              const onlineInterview =
                isOnlineInterview(
                  interview
                );

              const completed =
                isCompleted(interview);

              const canAttend =
                canAttendInterview(
                  interview
                );

              return (
                <div
                  className="my-interview-card"
                  key={
                    interview.id ||
                    interview.interview_id ||
                    index
                  }
                >

                  {/* =================================================
                      DATE
                  ================================================= */}

                  <div className="interview-date-box">

                    <FaCalendarAlt
                      className="date-icon"
                    />

                    <span className="date-number">
                      {getDay(interview)}
                    </span>

                    <span className="date-month">
                      {getMonth(interview)}
                    </span>

                  </div>

                  {/* =================================================
                      MAIN INFO
                  ================================================= */}

                  <div className="interview-main-info">

                    <h2>
                      {getInterviewTitle(
                        interview
                      )}
                    </h2>

                    <div className="interview-company">

                      <FaBuilding />

                      <span>
                        {getCompany(
                          interview
                        )}
                      </span>

                    </div>

                    <div className="interview-details">

                      {/* DATE / TIME */}

                      <div className="interview-detail">

                        <FaClock />

                        <div>

                          <strong>
                            {interviewTime ||
                              "-"}
                          </strong>

                          <span>
                            {formatDate(
                              interviewDate
                            )}
                          </span>

                        </div>

                      </div>

                      {/* TYPE / LOCATION */}

                      <div className="interview-detail">

                        {onlineInterview ? (
                          <FaVideo />
                        ) : (
                          <FaMapMarkerAlt />
                        )}

                        <div>

                          <strong>
                            {interviewType}
                          </strong>

                          <span>
                            {getLocation(
                              interview
                            )}
                          </span>

                        </div>

                      </div>

                      {/* INTERVIEWER */}

                      <div className="interview-detail">

                        <FaBuilding />

                        <div>

                          <strong>
                            Interviewer
                          </strong>

                          <span>
                            {getInterviewer(
                              interview
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        NOTES
                    ================================================= */}

                    {interview.notes && (
                      <div
                        style={{
                          marginTop: "10px",
                          color: "#666",
                          fontSize: "14px",
                        }}
                      >
                        <strong>
                          Notes:{" "}
                        </strong>

                        {interview.notes}
                      </div>
                    )}

                  </div>

                  {/* =================================================
                      RIGHT SIDE
                  ================================================= */}

                  <div className="interview-right">

                    {/* STATUS */}

                    <div
                      className={`interview-status ${normalizedStatus}`}
                    >

                      {getStatusIcon(
                        status
                      )}

                      <span>
                        {status}
                      </span>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="interview-action-buttons">

                      {/* VIEW DETAILS */}

                      <button
                        type="button"
                        className="view-interview-btn"
                        onClick={() =>
                          handleViewDetails(
                            interview
                          )
                        }
                      >

                        <FaEye />

                        View Details

                      </button>

                      {/* ATTEND INTERVIEW */}

                      {canAttend && (
                        <button
                          type="button"
                          className="join-interview-btn"
                          onClick={() =>
                            handleAttendInterview(
                              interview
                            )
                          }
                        >

                          <FaVideo />

                          Attend Interview

                          <FaExternalLinkAlt
                            style={{
                              marginLeft: "5px",
                              fontSize: "11px",
                            }}
                          />

                        </button>
                      )}

                      {/* COMPLETED */}

                      {completed && (
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "6px",
                            fontSize: "13px",
                            color: "#2e7d32",
                            marginTop: "6px",
                          }}
                        >

                          <FaCheckCircle />

                          Interview Completed

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )

        ) : (

          <div className="no-interviews">

            <div className="no-interview-icon">
              <FaCalendarAlt />
            </div>

            <h3>
              No interviews found
            </h3>

            <p>
              You don't have any interviews
              in this category.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default MyInterviews;