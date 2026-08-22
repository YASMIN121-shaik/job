import React, { useEffect, useState } from "react";

import {
  FaQuestionCircle,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaBriefcase,
  FaUserShield,
} from "react-icons/fa";

import "./JobSeekerSupport.css";

const API_URL = "http://localhost:5000";

function JobSeekerSupport() {
  const [email, setEmail] = useState("");

  const [formData, setFormData] = useState({
    recipient: "manager",
    category: "job",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const getLoggedInUser = () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setErrorMessage(
            "User information not found. Please login again."
          );
          return;
        }

        const user = JSON.parse(storedUser);

        if (!user || !user.email) {
          setErrorMessage(
            "User email not found. Please login again."
          );
          return;
        }

        setEmail(user.email.trim().toLowerCase());
      } catch (error) {
        console.error("User data error:", error);

        setErrorMessage(
          "Unable to read user information. Please login again."
        );
      }
    };

    getLoggedInUser();
  }, []);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  // =====================================================
  // HANDLE RECIPIENT CHANGE
  // =====================================================

  const handleRecipientChange = (recipient) => {
    if (loading) {
      return;
    }

    if (recipient === "manager") {
      setFormData((previous) => ({
        ...previous,
        recipient: "manager",
        category: "job",
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        recipient: "admin",
        category: "account",
      }));
    }

    setSuccessMessage("");
    setErrorMessage("");
  };

  // =====================================================
  // SUBMIT SUPPORT REQUEST
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!email) {
      setErrorMessage(
        "User email not found. Please login again."
      );
      return;
    }

    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!subject) {
      setErrorMessage("Please enter a subject.");
      return;
    }

    if (subject.length < 3) {
      setErrorMessage(
        "Subject must contain at least 3 characters."
      );
      return;
    }

    if (!message) {
      setErrorMessage("Please describe your problem.");
      return;
    }

    if (message.length < 10) {
      setErrorMessage(
        "Please provide more details about your problem."
      );
      return;
    }

    if (!["manager", "admin"].includes(formData.recipient)) {
      setErrorMessage("Invalid support recipient.");
      return;
    }

    try {
      setLoading(true);

      const requestBody = {
        email: email.trim().toLowerCase(),
        subject,
        message,
        category: formData.category,
        recipient: formData.recipient,
      };

      console.log(
        "Sending support request:",
        requestBody
      );

      const response = await fetch(
        `${API_URL}/api/support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      // -----------------------------------------
      // SAFELY READ RESPONSE
      // -----------------------------------------

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (parseError) {
        console.error(
          "Invalid JSON response from server:",
          responseText
        );

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      console.log(
        "Support API status:",
        response.status
      );

      console.log(
        "Support API response:",
        data
      );

      // -----------------------------------------
      // HANDLE BACKEND ERROR
      // -----------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to create support request. Server returned ${response.status}.`
        );
      }

      if (data.success !== true) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to create support request."
        );
      }

      // -----------------------------------------
      // SUCCESS
      // -----------------------------------------

      setSuccessMessage(
        data.message ||
          "Support request sent successfully."
      );

      setFormData((previous) => ({
        ...previous,
        subject: "",
        message: "",
      }));
    } catch (error) {
      console.error(
        "Support request error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to send support request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="jobseeker-support-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="jobseeker-support-header">

        <div className="jobseeker-support-title">

          <div className="jobseeker-support-icon">
            <FaQuestionCircle />
          </div>

          <div>
            <h1>Help & Support</h1>

            <p>
              Send your question to the appropriate
              support team.
            </p>
          </div>

        </div>

      </div>

      {/* =================================================
          CARD
      ================================================= */}

      <div className="jobseeker-support-card">

        <div className="jobseeker-support-card-header">

          <div>
            <h2>Contact Support</h2>

            <p>
              Choose who should receive your request.
            </p>
          </div>

          <FaEnvelope />

        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {successMessage && (
          <div className="jobseeker-support-success">

            <FaCheckCircle />

            <span>
              {successMessage}
            </span>

          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {errorMessage && (
          <div className="jobseeker-support-error">

            <FaExclamationCircle />

            <span>
              {errorMessage}
            </span>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="jobseeker-form-group">

            <label htmlFor="support-email">
              Email Address
            </label>

            <div className="jobseeker-input">

              <FaEnvelope />

              <input
                id="support-email"
                type="email"
                value={email}
                readOnly
                disabled={loading}
              />

            </div>

          </div>

          {/* SUPPORT TYPE */}

          <div className="jobseeker-form-group">

            <label>
              What do you need help with?
            </label>

            <div className="support-type-options">

              {/* MANAGER */}

              <button
                type="button"
                className={
                  formData.recipient === "manager"
                    ? "support-type active"
                    : "support-type"
                }
                onClick={() =>
                  handleRecipientChange("manager")
                }
                disabled={loading}
              >

                <FaBriefcase />

                <div>
                  <strong>
                    Job Related
                  </strong>

                  <span>
                    Send to Manager
                  </span>
                </div>

              </button>

              {/* ADMIN */}

              <button
                type="button"
                className={
                  formData.recipient === "admin"
                    ? "support-type active"
                    : "support-type"
                }
                onClick={() =>
                  handleRecipientChange("admin")
                }
                disabled={loading}
              >

                <FaUserShield />

                <div>
                  <strong>
                    Login / Account
                  </strong>

                  <span>
                    Send to Admin
                  </span>
                </div>

              </button>

            </div>

          </div>

          {/* SUBJECT */}

          <div className="jobseeker-form-group">

            <label htmlFor="support-subject">
              Subject
            </label>

            <input
              id="support-subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={
                formData.recipient === "manager"
                  ? "Example: Problem with my job application"
                  : "Example: Unable to login"
              }
              maxLength={150}
              disabled={loading}
            />

          </div>

          {/* MESSAGE */}

          <div className="jobseeker-form-group">

            <label htmlFor="support-message">
              Message
            </label>

            <textarea
              id="support-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={
                formData.recipient === "manager"
                  ? "Describe your job-related problem..."
                  : "Describe your login or account problem..."
              }
              rows={7}
              maxLength={2000}
              disabled={loading}
            />

            <small>
              {formData.message.length}/2000
            </small>

          </div>

          {/* RECIPIENT INFO */}

          <div className="support-recipient-info">

            {formData.recipient === "manager" ? (
              <>
                <FaBriefcase />

                <span>
                  This request will be sent to the
                  Manager Support Panel.
                </span>
              </>
            ) : (
              <>
                <FaUserShield />

                <span>
                  This request will be sent to the
                  Admin Support Panel.
                </span>
              </>
            )}

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="jobseeker-support-submit"
          >

            {loading ? (
              "Sending..."
            ) : (
              <>
                <FaPaperPlane />

                {formData.recipient === "manager"
                  ? "Send Request to Manager"
                  : "Send Request to Admin"}
              </>
            )}

          </button>

        </form>

      </div>

    </div>
  );
}

export default JobSeekerSupport;