import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaRupeeSign,
  FaUserTie,
  FaClock,
  FaFileAlt,
} from "react-icons/fa";

import "./Applications.css";
import JobTracker from "./JobTracker";

const API_URL = "http://localhost:5000";

function Applications() {
  // =====================================================
  // STATE
  // =====================================================

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [withdrawingId, setWithdrawingId] =
    useState(null);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "LOCAL STORAGE USER ERROR:",
        error
      );

      return null;
    }
  };

  const user = getLoggedInUser();

  const userEmail =
    user?.email ||
    user?.Email ||
    user?.user?.email ||
    user?.user?.Email ||
    "";

  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

    if (
      value === "interview" ||
      value === "interview scheduled" ||
      value === "scheduled interview" ||
      value === "schedule interview"
    ) {
      return "Interview";
    }

    if (
      value === "shortlisted" ||
      value === "shortlist" ||
      value === "short listed" ||
      value === "accepted" ||
      value === "accept"
    ) {
      return "Shortlisted";
    }

    if (
      value === "rejected" ||
      value === "reject" ||
      value === "declined"
    ) {
      return "Rejected";
    }

    return "Applied";
  };

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!userEmail) {
        throw new Error(
          "User information not found. Please login again."
        );
      }

      const url =
        `${API_URL}/api/jobseeker/applications?email=` +
        encodeURIComponent(userEmail);

      console.log(
        "========================================"
      );

      console.log(
        "FETCHING JOB SEEKER APPLICATIONS"
      );

      console.log(
        "Logged-in email:",
        userEmail
      );

      console.log(
        "Applications API:",
        url
      );

      const response = await fetch(url);

      let data = {};

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error(
          "INVALID JSON RESPONSE:",
          jsonError
        );
      }

      console.log(
        "Applications API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch applications from server."
        );
      }

      let applicationData = [];

      if (Array.isArray(data)) {
        applicationData = data;
      } else if (
        Array.isArray(data?.applications)
      ) {
        applicationData = data.applications;
      } else if (
        Array.isArray(data?.data)
      ) {
        applicationData = data.data;
      } else if (
        Array.isArray(data?.results)
      ) {
        applicationData = data.results;
      }

      console.log(
        "Number of applications:",
        applicationData.length
      );

      applicationData.forEach(
        (application, index) => {
          console.log(
            `Application ${index + 1}:`,
            {
              id: application.id,
              job_id: application.job_id,

              title:
                application.title ||
                application.job_title,

              company:
                application.company,

              location:
                application.location,

              salary:
                application.salary,

              job_type:
                application.job_type,

              category:
                application.category,

              job_experience:
                application.job_experience,

              applicant_experience:
                application.applicant_experience,

              status:
                application.status,

              // Interview information is still available
              // inside View Details.
              interview_id:
                application.interview_id,

              interview_date:
                application.interview_date,

              interview_time:
                application.interview_time,

              interview_type:
                application.interview_type,

              interviewer:
                application.interviewer,

              interview_status:
                application.interview_status,

              interview_notes:
                application.interview_notes,
            }
          );
        }
      );

      setApplications(applicationData);
      setFilter("All");
      setError("");

    } catch (error) {
      console.error(
        "FETCH APPLICATIONS ERROR:",
        error
      );

      setApplications([]);

      setError(
        error?.message ||
          "Unable to load applications from server."
      );

    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
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
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "Not specified";
    }

    const value = String(time);

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return value;
    }

    const period =
      hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  };

  // =====================================================
  // JOB HELPERS
  // =====================================================

  const getJobTitle = (application) => {
    return (
      application?.title ||
      application?.job_title ||
      application?.position ||
      "Job Title"
    );
  };

  const getCompany = (application) => {
    return (
      application?.company ||
      "Company"
    );
  };

  const getLocation = (application) => {
    return (
      application?.location ||
      "Not specified"
    );
  };

  const getJobType = (application) => {
    return (
      application?.job_type ||
      "Full Time"
    );
  };

  const getSalary = (application) => {
    return (
      application?.salary ||
      "Not specified"
    );
  };

  const getCategory = (application) => {
    return (
      application?.category ||
      "Not specified"
    );
  };

  const getJobExperience = (application) => {
    return (
      application?.job_experience ||
      "Not specified"
    );
  };

  const getApplicantExperience = (
    application
  ) => {
    return (
      application?.applicant_experience ||
      application?.experience ||
      "Not specified"
    );
  };

  const getAppliedDate = (application) => {
    return (
      application?.applied_at ||
      application?.appliedAt ||
      null
    );
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredApplications = useMemo(() => {
    if (filter === "All") {
      return applications;
    }

    return applications.filter(
      (application) =>
        normalizeStatus(
          application?.status
        ) === filter
    );
  }, [
    applications,
    filter,
  ]);

  // =====================================================
  // COUNTS
  // =====================================================

  const totalCount =
    applications.length;

  const appliedCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application?.status
        ) === "Applied"
    ).length;

  const shortlistedCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application?.status
        ) === "Shortlisted"
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        normalizeStatus(
          application?.status
        ) === "Rejected"
    ).length;

  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status) => {
    const normalizedStatus =
      normalizeStatus(status);

    if (
      normalizedStatus === "Interview"
    ) {
      return <FaCalendarAlt />;
    }

    if (
      normalizedStatus === "Shortlisted"
    ) {
      return <FaCheckCircle />;
    }

    if (
      normalizedStatus === "Rejected"
    ) {
      return <FaTimesCircle />;
    }

    return <FaHourglassHalf />;
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    return normalizeStatus(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =====================================================
  // VIEW DETAILS
  // =====================================================

  const handleViewDetails = (
    application
  ) => {
    setSelectedApplication(
      application
    );
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    setSelectedApplication(null);
  };

  // =====================================================
  // WITHDRAW APPLICATION
  // =====================================================

  const withdrawApplication =
    async (application) => {
      if (!application?.id) {
        alert(
          "Application ID not found."
        );

        return;
      }

      const confirmWithdraw =
        window.confirm(
          "Are you sure you want to withdraw this application?"
        );

      if (!confirmWithdraw) {
        return;
      }

      try {
        setWithdrawingId(
          application.id
        );

        const response =
          await fetch(
            `${API_URL}/api/jobseeker/applications/${application.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch (jsonError) {
          console.error(
            "DELETE RESPONSE JSON ERROR:",
            jsonError
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to withdraw application."
          );
        }

        alert(
          "Application withdrawn successfully."
        );

        setApplications(
          (previousApplications) =>
            previousApplications.filter(
              (item) =>
                item.id !==
                application.id
            )
        );

        if (
          selectedApplication?.id ===
          application.id
        ) {
          setSelectedApplication(
            null
          );
        }

      } catch (error) {
        console.error(
          "WITHDRAW APPLICATION ERROR:",
          error
        );

        alert(
          error?.message ||
            "Unable to withdraw application."
        );

      } finally {
        setWithdrawingId(null);
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="applications-page">

        <div className="no-applications">

          <div className="no-application-icon">
            <FaBriefcase />
          </div>

          <h3>
            Loading Applications...
          </h3>

          <p>
            Please wait while we load
            your applications.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="applications-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="applications-header">

        <div>

          <h1>
            My Applications
          </h1>

          <p>
            Track and manage your job
            applications
          </p>

        </div>

        <div className="application-total">

          <FaBriefcase />

          <div>

            <strong>
              {totalCount}
            </strong>

            <span>
              Total Applications
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="no-applications"
          style={{
            marginBottom: "20px",
          }}
        >

          <div className="no-application-icon">
            <FaTimesCircle />
          </div>

          <h3>
            Unable to load applications
          </h3>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={
              fetchApplications
            }
            className="application-view-btn"
          >
            Try Again
          </button>

        </div>

      )}

      {/* =================================================
          STATISTICS
          INTERVIEW CARD REMOVED
      ================================================= */}

      <div className="application-stats">

        {/* APPLIED */}

        <div className="application-stat-card">

          <div className="stat-icon applied-icon">
            <FaHourglassHalf />
          </div>

          <div>

            <span>
              Applied
            </span>

            <strong>
              {appliedCount}
            </strong>

          </div>

        </div>

        {/* SHORTLISTED */}

        <div className="application-stat-card">

          <div className="stat-icon shortlisted-icon">
            <FaCheckCircle />
          </div>

          <div>

            <span>
              Shortlisted
            </span>

            <strong>
              {shortlistedCount}
            </strong>

          </div>

        </div>

        {/* REJECTED */}

        <div className="application-stat-card">

          <div className="stat-icon rejected-icon">
            <FaTimesCircle />
          </div>

          <div>

            <span>
              Rejected
            </span>

            <strong>
              {rejectedCount}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          FILTER HEADER
          INTERVIEW FILTER REMOVED
      ================================================= */}

      <div className="applications-filter">

        <div>

          <h2>
            Application History
          </h2>

          <p>
            {filteredApplications.length}{" "}
            applications found
          </p>

        </div>

        <div className="filter-buttons">

          {[
            "All",
            "Applied",
            "Shortlisted",
            "Rejected",
          ].map((item) => (

            <button
              key={item}
              type="button"
              className={
                filter === item
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() =>
                setFilter(item)
              }
            >
              {item}
            </button>

          ))}

        </div>

      </div>

      {/* =================================================
          APPLICATION LIST
      ================================================= */}

      <div className="applications-list">

        {filteredApplications.length > 0 ? (

          filteredApplications.map(
            (application) => {

              const status =
                normalizeStatus(
                  application?.status
                );

              const applicationId =
                application?.id ||
                application?.application_id;

              return (

                <div
                  className="application-card"
                  key={applicationId}
                >

                  {/* COMPANY ICON */}

                  <div className="application-company-icon">
                    <FaBuilding />
                  </div>

                  {/* JOB INFORMATION */}

                  <div className="application-job-info">

                    <div className="application-title-row">

                      <div>

                        <h3>
                          {getJobTitle(
                            application
                          )}
                        </h3>

                        <p className="application-company">
                          {getCompany(
                            application
                          )}
                        </p>

                      </div>

                      {/* STATUS */}

                      <div
                        className={`application-status ${getStatusClass(
                          application.status
                        )}`}
                      >

                        {getStatusIcon(
                          application.status
                        )}

                        <span>
                          {status}
                        </span>

                      </div>

                    </div>

                    {/* JOB META */}

                    <div className="application-details">

                      <span>
                        <FaMapMarkerAlt />

                        {getLocation(
                          application
                        )}
                      </span>

                      <span>
                        <FaBriefcase />

                        {getJobType(
                          application
                        )}
                      </span>

                      <span>
                        <FaRupeeSign />

                        {getSalary(
                          application
                        )}
                      </span>

                    </div>

                    {/* DATE */}

                    <div className="application-date">

                      <span>

                        <FaCalendarAlt />

                        Applied:{" "}

                        {formatDate(
                          getAppliedDate(
                            application
                          )
                        )}

                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="application-actions">

                    <button
                      type="button"
                      className="application-view-btn"
                      onClick={() =>
                        handleViewDetails(
                          application
                        )
                      }
                    >

                      <FaEye />

                      View Details

                    </button>

                    {status !==
                      "Rejected" && (

                      <button
                        type="button"
                        className="application-withdraw-btn"
                        disabled={
                          withdrawingId ===
                          applicationId
                        }
                        onClick={() =>
                          withdrawApplication(
                            application
                          )
                        }
                      >

                        <FaTimes />

                        {withdrawingId ===
                        applicationId
                          ? "Withdrawing..."
                          : "Withdraw"}

                      </button>

                    )}

                  </div>

                </div>

              );
            }
          )

        ) : (

          <div className="no-applications">

            <div className="no-application-icon">
              <FaBriefcase />
            </div>

            <h3>
              No Applications Found
            </h3>

            <p>

              {filter === "All"
                ? "You haven't applied for any jobs yet."
                : `You don't have any ${filter.toLowerCase()} applications.`}

            </p>

            {filter !== "All" &&
              applications.length > 0 && (

              <button
                type="button"
                className="application-view-btn"
                onClick={() =>
                  setFilter("All")
                }
              >
                View All Applications
              </button>

            )}

          </div>

        )}

      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedApplication && (

        <div
          className="job-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="job-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="modal-close-btn"
              onClick={closeModal}
            >
              <FaTimes />
            </button>

            {/* COMPANY ICON */}

            <div className="modal-company-icon">
              <FaBuilding />
            </div>

            {/* TITLE */}

            <h2>
              {getJobTitle(
                selectedApplication
              )}
            </h2>

            <p className="modal-company">
              {getCompany(
                selectedApplication
              )}
            </p>

            {/* STATUS */}

            <div
              className={`application-status ${getStatusClass(
                selectedApplication.status
              )}`}
              style={{
                display: "inline-flex",
                marginBottom: "20px",
              }}
            >

              {getStatusIcon(
                selectedApplication.status
              )}

              <span>
                {normalizeStatus(
                  selectedApplication.status
                )}
              </span>

            </div>

            {/* =================================================
                JOB INFORMATION
            ================================================= */}

            <div className="modal-info-grid">

              <div>

                <FaMapMarkerAlt />

                <span>
                  {getLocation(
                    selectedApplication
                  )}
                </span>

              </div>

              <div>

                <FaBriefcase />

                <span>
                  {getJobType(
                    selectedApplication
                  )}
                </span>

              </div>

              <div>

                <FaRupeeSign />

                <span>
                  {getSalary(
                    selectedApplication
                  )}
                </span>

              </div>

              <div>

                <FaCalendarAlt />

                <span>

                  Applied:{" "}

                  {formatDate(
                    getAppliedDate(
                      selectedApplication
                    )
                  )}

                </span>

              </div>

              <div>

                <FaBriefcase />

                <span>
                  {getCategory(
                    selectedApplication
                  )}
                </span>

              </div>

              <div>

                <FaUserTie />

                <span>
                  {getJobExperience(
                    selectedApplication
                  )}
                </span>

              </div>

            </div>

            {/* =================================================
                JOB CATEGORY
            ================================================= */}

            <div className="modal-section">

              <h4>
                Category
              </h4>

              <p>
                {getCategory(
                  selectedApplication
                )}
              </p>

            </div>

            {/* =================================================
                REQUIRED EXPERIENCE
            ================================================= */}

            <div className="modal-section">

              <h4>
                Required Experience
              </h4>

              <p>
                {getJobExperience(
                  selectedApplication
                )}
              </p>

            </div>

            {/* =================================================
                JOB TYPE
            ================================================= */}

            <div className="modal-section">

              <h4>
                Job Type
              </h4>

              <p>
                {getJobType(
                  selectedApplication
                )}
              </p>

            </div>

            {/* =================================================
                SALARY
            ================================================= */}

            <div className="modal-section">

              <h4>
                Salary
              </h4>

              <p>
                {getSalary(
                  selectedApplication
                )}
              </p>

            </div>

            {/* =================================================
                APPLICANT EXPERIENCE
            ================================================= */}

            <div className="modal-section">

              <h4>
                Your Experience
              </h4>

              <p>
                {getApplicantExperience(
                  selectedApplication
                )}
              </p>

            </div>

            {/* =================================================
                RESUME
            ================================================= */}

            {selectedApplication.resume && (

              <div className="modal-section">

                <h4>
                  Resume
                </h4>

                <p>

                  <FaFileAlt />{" "}

                  {selectedApplication.resume}

                </p>

              </div>

            )}

            {/* =================================================
                INTERVIEW DETAILS
                KEPT ONLY INSIDE VIEW DETAILS
            ================================================= */}

            {selectedApplication.interview_id && (

              <div className="modal-section interview-section">

                <h4>

                  <FaCalendarAlt />{" "}

                  Interview Details

                </h4>

                <p>

                  <strong>
                    Date:
                  </strong>{" "}

                  {formatDate(
                    selectedApplication.interview_date
                  )}

                </p>

                <p>

                  <strong>
                    Time:
                  </strong>{" "}

                  <FaClock />{" "}

                  {formatTime(
                    selectedApplication.interview_time
                  )}

                </p>

                <p>

                  <strong>
                    Interview Type:
                  </strong>{" "}

                  {selectedApplication.interview_type ||
                    "Not specified"}

                </p>

                <p>

                  <strong>
                    Interviewer:
                  </strong>{" "}

                  {selectedApplication.interviewer ||
                    "Not assigned"}

                </p>

                <p>

                  <strong>
                    Status:
                  </strong>{" "}

                  {selectedApplication.interview_status ||
                    "Scheduled"}

                </p>

                {selectedApplication.interview_notes && (

                  <p>

                    <strong>
                      Notes:
                    </strong>{" "}

                    {selectedApplication.interview_notes}

                  </p>

                )}

              </div>

            )}

            {/* =================================================
                APPLICANT DETAILS
            ================================================= */}

            <div className="modal-section">

              <h4>
                Applicant Details
              </h4>

              <p>

                <strong>
                  Name:
                </strong>{" "}

                {selectedApplication.applicant_name ||
                  user?.fullname ||
                  user?.name ||
                  "Not specified"}

              </p>

              <p>

                <strong>
                  Email:
                </strong>{" "}

                {selectedApplication.email ||
                  userEmail ||
                  "Not specified"}

              </p>

              <p>

                <strong>
                  Phone:
                </strong>{" "}

                {selectedApplication.phone ||
                  user?.phone ||
                  "Not specified"}

              </p>

            </div>

            {/* =================================================
                WITHDRAW
            ================================================= */}

            {normalizeStatus(
              selectedApplication.status
            ) !== "Rejected" && (

              <button
                type="button"
                className="application-withdraw-btn"
                disabled={
                  withdrawingId ===
                  selectedApplication.id
                }
                onClick={() =>
                  withdrawApplication(
                    selectedApplication
                  )
                }
              >

                <FaTimes />

                {withdrawingId ===
                selectedApplication.id
                  ? "Withdrawing..."
                  : "Withdraw Application"}

              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default Applications;