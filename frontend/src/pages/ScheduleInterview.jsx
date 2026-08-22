import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaVideo,
  FaArrowLeft,
  FaSave,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "./ScheduleInterview.css";

const API_URL = "http://localhost:5000";

function ScheduleInterview() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [applications, setApplications] = useState([]);

  const [
    loadingApplications,
    setLoadingApplications,
  ] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    application_id: "",
    interview_date: "",
    interview_time: "",
    interview_type: "Online",
    meeting_link: "",
    interviewer: "",
    status: "Scheduled",
    notes: "",
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token || !token.trim()) {
      return null;
    }

    return token;
  };

  // =====================================================
  // HANDLE AUTH ERROR
  // =====================================================

  const handleAuthError = () => {
    localStorage.removeItem("token");

    setError(
      "Your session has expired. Please login again."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token is missing. Please login again."
        );

        setLoadingApplications(false);

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      /*
       * IMPORTANT
       *
       * This endpoint must exist on your backend.
       *
       * The old version used:
       *
       * /api/jobs/applications
       *
       * which does not belong to your manager interview
       * routes.
       *
       * We keep application fetching separate because
       * managerRoutes.js currently does NOT define
       * GET /api/manager/applications.
       */

      const response = await fetch(
        `${API_URL}/api/jobs/applications`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "Applications response:",
        data
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleAuthError();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch applications"
        );
      }

      /*
       * Support several possible backend response names.
       */

      const applicationList =
        Array.isArray(data.applications)
          ? data.applications
          : Array.isArray(data.data)
          ? data.data
          : [];

      setApplications(applicationList);
    } catch (err) {
      console.error(
        "FETCH APPLICATIONS ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load applications"
      );

      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  // =====================================================
  // HANDLE FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SCHEDULE INTERVIEW
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!formData.application_id) {
      setError(
        "Please select a candidate."
      );
      return;
    }

    if (!formData.interview_date) {
      setError(
        "Please select an interview date."
      );
      return;
    }

    if (!formData.interview_time) {
      setError(
        "Please select an interview time."
      );
      return;
    }

    if (
      formData.interview_type === "Online" &&
      !formData.meeting_link.trim()
    ) {
      setError(
        "Please enter a meeting link for the online interview."
      );
      return;
    }

    // ---------------------------------------------------
    // TOKEN
    // ---------------------------------------------------

    const token = getToken();

    if (!token) {
      setError(
        "Authentication token is missing. Please login again."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    try {
      setSaving(true);

      // -------------------------------------------------
      // REQUEST BODY
      // -------------------------------------------------

      const requestBody = {
        application_id: Number(
          formData.application_id
        ),

        interview_date:
          formData.interview_date,

        interview_time:
          formData.interview_time,

        interview_type:
          formData.interview_type,

        /*
         * Send meeting link only for online interviews.
         */
        meeting_link:
          formData.interview_type === "Online"
            ? formData.meeting_link.trim()
            : null,

        interviewer:
          formData.interviewer.trim() || null,

        status:
          formData.status,

        notes:
          formData.notes.trim() || null,
      };

      console.log(
        "================================="
      );

      console.log(
        "SENDING INTERVIEW DATA:"
      );

      console.log(
        requestBody
      );

      console.log(
        "================================="
      );

      // -------------------------------------------------
      // CREATE INTERVIEW
      // -------------------------------------------------

      /*
       * IMPORTANT:
       *
       * managerRoutes.js defines:
       *
       * POST /api/manager/interviews
       *
       * NOT:
       *
       * POST /api/jobs/interviews
       */

      const response = await fetch(
        `${API_URL}/api/manager/interviews`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            requestBody
          ),
        }
      );

      const data =
        await response.json();

      console.log(
        "Schedule interview response:",
        data
      );

      // -------------------------------------------------
      // AUTH ERROR
      // -------------------------------------------------

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleAuthError();
        return;
      }

      // -------------------------------------------------
      // API ERROR
      // -------------------------------------------------

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to schedule interview"
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      console.log(
        "SAVED INTERVIEW:",
        data.interview
      );

      console.log(
        "SAVED MEETING LINK:",
        data.interview?.meeting_link
      );

      alert(
        "Interview scheduled successfully!"
      );

      /*
       * Go back to Manager Interviews.
       *
       * Your ManagerInterviews.jsx uses:
       *
       * /api/manager/interviews
       *
       * so it will display the newly created
       * interview after loading.
       */
navigate("/manager/interviews");

    } catch (err) {
      console.error(
        "SCHEDULE INTERVIEW ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to schedule interview"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate("/manager/interviews");
  };

  // =====================================================
  // TODAY
  // =====================================================

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // =====================================================
  // GET APPLICATION NAME
  // =====================================================

  const getApplicantName = (
    application
  ) => {
    return (
      application.applicant_name ||
      application.name ||
      application.fullname ||
      application.full_name ||
      "Unknown Candidate"
    );
  };

  // =====================================================
  // GET JOB TITLE
  // =====================================================

  const getJobTitle = (
    application
  ) => {
    return (
      application.job_title ||
      application.position ||
      application.title ||
      application.job_name ||
      "Unknown Job"
    );
  };

  // =====================================================
  // GET EMAIL
  // =====================================================

  const getEmail = (
    application
  ) => {
    return (
      application.email ||
      application.applicant_email ||
      ""
    );
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="schedule-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="schedule-header">

        <div className="schedule-title">

          <button
            type="button"
            className="back-btn"
            onClick={handleCancel}
            disabled={saving}
            title="Back to Interviews"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>
              Schedule Interview
            </h1>

            <p>
              Schedule an interview with a candidate
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          CARD
      ================================================= */}

      <div className="schedule-card">

        {/* ERROR */}

        {error && (
          <div className="schedule-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          {/* =================================================
              CANDIDATE INFORMATION
          ================================================= */}

          <div className="form-section">

            <div className="section-heading">

              <FaUserTie />

              <div>
                <h2>
                  Candidate Information
                </h2>

                <p>
                  Select an applicant for the interview
                </p>
              </div>

            </div>

            <div className="form-group">

              <label>
                Candidate / Application
                <span>*</span>
              </label>

              {loadingApplications ? (

                <div className="loading-applications">
                  Loading applications...
                </div>

              ) : applications.length === 0 ? (

                <div className="no-applications">

                  <p>
                    No applications available.
                  </p>

                  <span>
                    Candidates must apply for a job
                    before scheduling an interview.
                  </span>

                </div>

              ) : (

                <select
                  name="application_id"
                  value={
                    formData.application_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                >

                  <option value="">
                    Select candidate
                  </option>

                  {applications.map(
                    (application) => (

                      <option
                        key={
                          application.id
                        }
                        value={
                          application.id
                        }
                      >

                        {getApplicantName(
                          application
                        )}

                        {" - "}

                        {getJobTitle(
                          application
                        )}

                        {getEmail(
                          application
                        )
                          ? ` - ${getEmail(
                              application
                            )}`
                          : ""}

                      </option>

                    )
                  )}

                </select>

              )}

            </div>

          </div>

          {/* =================================================
              INTERVIEW DETAILS
          ================================================= */}

          <div className="form-section">

            <div className="section-heading">

              <FaCalendarAlt />

              <div>

                <h2>
                  Interview Details
                </h2>

                <p>
                  Set the date, time and interview mode
                </p>

              </div>

            </div>

            <div className="form-grid">

              {/* DATE */}

              <div className="form-group">

                <label>
                  Interview Date
                  <span>*</span>
                </label>

                <div className="input-icon">

                  <FaCalendarAlt />

                  <input
                    type="date"
                    name="interview_date"
                    min={today}
                    value={
                      formData.interview_date
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={saving}
                  />

                </div>

              </div>

              {/* TIME */}

              <div className="form-group">

                <label>
                  Interview Time
                  <span>*</span>
                </label>

                <div className="input-icon">

                  <FaClock />

                  <input
                    type="time"
                    name="interview_time"
                    value={
                      formData.interview_time
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={saving}
                  />

                </div>

              </div>

              {/* INTERVIEW TYPE */}

              <div className="form-group">

                <label>
                  Interview Mode
                </label>

                <div className="input-icon">

                  {formData.interview_type ===
                  "Online" ? (
                    <FaVideo />
                  ) : (
                    <FaMapMarkerAlt />
                  )}

                  <select
                    name="interview_type"
                    value={
                      formData.interview_type
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  >

                    <option value="Online">
                      Online
                    </option>

                    <option value="Offline">
                      Offline
                    </option>

                  </select>

                </div>

              </div>

              {/* MEETING LINK */}

             {/* MEETING LINK */}

{formData.interview_type === "Online" && (
  <div className="form-group">

    <label>
      Meeting Link
      <span>*</span>
    </label>

    <div className="input-icon">

      <FaVideo />

      <input
        type="url"
        name="meeting_link"
        placeholder="https://meet.google.com/..."
        value={formData.meeting_link}
        onChange={handleChange}
        required
        disabled={saving}
      />

    </div>

  </div>
)}

              {/* INTERVIEWER */}

              <div className="form-group">

                <label>
                  Interviewer
                </label>

                <div className="input-icon">

                  <FaUserTie />

                  <input
                    type="text"
                    name="interviewer"
                    placeholder="Enter interviewer name"
                    value={
                      formData.interviewer
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                >

                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* =================================================
              NOTES
          ================================================= */}

          <div className="form-section">

            <div className="section-heading">

              <div>

                <h2>
                  Additional Notes
                </h2>

                <p>
                  Add any instructions or information
                </p>

              </div>

            </div>

            <div className="form-group">

              <label>
                Notes
              </label>

              <textarea
                name="notes"
                rows="5"
                placeholder="Enter interview notes..."
                value={
                  formData.notes
                }
                onChange={
                  handleChange
                }
                disabled={saving}
              />

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-form-btn"
              onClick={
                handleCancel
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-interview-btn"
              disabled={
                saving ||
                loadingApplications ||
                applications.length === 0
              }
            >

              <FaSave />

              {saving
                ? "Scheduling..."
                : "Schedule Interview"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ScheduleInterview;