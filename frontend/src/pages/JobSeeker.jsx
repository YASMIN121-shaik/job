import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobSeeker.css";

const API_URL = "http://localhost:5000";

function JobSeeker() {
  const navigate = useNavigate();

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);

  // =====================================================
  // DASHBOARD
  // =====================================================

  const [dashboard, setDashboard] = useState({
    totalApplications: 0,
    savedJobs: 0,
    upcomingInterviews: 0,
    profileCompletion: 0,

    recentJobs: [],
    recentApplications: [],
    upcomingInterviewList: [],
    savedJobList: [],

    applicationStatus: {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingJobId, setApplyingJobId] = useState(null);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // API HELPER
  // =====================================================

  const apiRequest = async (url, options = {}) => {
    const token = getToken();

    const headers = {
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data = {};

    try {
      data = await response.json();
    } catch (jsonError) {
      console.warn("Response was not valid JSON:", jsonError);
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  // =====================================================
  // GET LOGGED IN USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        console.log("No user found in localStorage");
        return null;
      }

      const parsedUser = JSON.parse(storedUser);

      console.log("Logged-in user:", parsedUser);

      return parsedUser;
    } catch (error) {
      console.error("Error reading user:", error);
      return null;
    }
  };

  // =====================================================
  // PROFILE COMPLETION
  // =====================================================

  const calculateProfileCompletion = (userData) => {
    if (!userData) {
      return 0;
    }

    const fields = [
      userData.fullname,
      userData.email,
      userData.phone,
      userData.location,
      userData.job_title,
      userData.experience,
      userData.education,
      userData.skills,
      userData.linkedin,
      userData.github,
    ];

    const completedFields = fields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ""
    ).length;

    return Math.round((completedFields / fields.length) * 100);
  };

  // =====================================================
  // GET LATEST PROFILE
  // =====================================================

  const fetchLatestProfile = async (loggedInUser) => {
    try {
      if (!loggedInUser?.id) {
        return loggedInUser;
      }

      const data = await apiRequest(
        `${API_URL}/api/jobseeker/profile/${loggedInUser.id}`
      );

      console.log("Latest profile response:", data);

      if (data.success && data.user) {
        const latestUser = data.user;

        localStorage.setItem(
          "user",
          JSON.stringify(latestUser)
        );

        setUser(latestUser);

        return latestUser;
      }

      return loggedInUser;
    } catch (error) {
      console.error("FETCH PROFILE ERROR:", error);

      // Do not stop dashboard if profile endpoint has an issue.
      return loggedInUser;
    }
  };

  // =====================================================
  // FETCH DASHBOARD STATS
  // =====================================================

  const fetchDashboardStats = async (email) => {
    try {
      const data = await apiRequest(
        `${API_URL}/api/jobseeker/dashboard?email=${encodeURIComponent(
          email
        )}`
      );

      console.log("Dashboard API response:", data);

      return data;
    } catch (error) {
      console.error("Dashboard stats error:", error);
      throw error;
    }
  };

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = async (email) => {
    try {
      const data = await apiRequest(
        `${API_URL}/api/jobseeker/applications?email=${encodeURIComponent(
          email
        )}`
      );

      console.log("Applications response:", data);

      return Array.isArray(data.applications)
        ? data.applications
        : Array.isArray(data.data)
        ? data.data
        : [];
    } catch (error) {
      console.error("Applications error:", error);

      return [];
    }
  };

  // =====================================================
  // FETCH SAVED JOBS
  // =====================================================

  const fetchSavedJobs = async (email) => {
    try {
      const data = await apiRequest(
        `${API_URL}/api/jobseeker/saved-jobs?email=${encodeURIComponent(
          email
        )}`
      );

      console.log("Saved jobs response:", data);

      if (Array.isArray(data.savedJobs)) {
        return data.savedJobs;
      }

      if (Array.isArray(data.jobs)) {
        return data.jobs;
      }

      if (Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error("Saved jobs error:", error);

      return [];
    }
  };

  // =====================================================
  // FETCH INTERVIEWS
  // =====================================================

  const fetchInterviews = async (email) => {
    try {
      const data = await apiRequest(
        `${API_URL}/api/jobseeker/interviews?email=${encodeURIComponent(
          email
        )}`
      );

      console.log("Interviews response:", data);

      if (Array.isArray(data.interviews)) {
        return data.interviews;
      }

      if (Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error("Interviews error:", error);

      return [];
    }
  };

  // =====================================================
  // FETCH RECENT JOBS
  // =====================================================

  const fetchRecentJobs = async () => {
    try {
      const data = await apiRequest(
        `${API_URL}/api/jobs`
      );

      console.log("Jobs response:", data);

      let jobs = [];

      if (Array.isArray(data)) {
        jobs = data;
      } else if (Array.isArray(data.jobs)) {
        jobs = data.jobs;
      } else if (Array.isArray(data.data)) {
        jobs = data.data;
      } else if (Array.isArray(data.recentJobs)) {
        jobs = data.recentJobs;
      }

      // Normalize job IDs
      const normalizedJobs = jobs.map((job) => ({
        ...job,
        id: job.id || job.job_id,
      }));

      // Show latest five jobs
      return normalizedJobs.slice(0, 5);
    } catch (error) {
      console.error("Recent jobs error:", error);

      return [];
    }
  };

  // =====================================================
  // GET INTERVIEW DATE
  // =====================================================

  const getInterviewDate = (interview) => {
    return (
      interview?.interview_date ||
      interview?.scheduled_date ||
      interview?.date ||
      interview?.interviewDate ||
      null
    );
  };

  // =====================================================
  // GET INTERVIEW TIME
  // =====================================================

  const getInterviewTime = (interview) => {
    return (
      interview?.interview_time ||
      interview?.scheduled_time ||
      interview?.time ||
      interview?.interviewTime ||
      ""
    );
  };

  // =====================================================
  // CHECK UPCOMING INTERVIEW
  // =====================================================

  const isUpcomingInterview = (interview) => {
    const interviewDate = getInterviewDate(interview);

    if (!interviewDate) {
      return false;
    }

    const date = new Date(interviewDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    date.setHours(23, 59, 59, 999);

    return date >= today;
  };

  // =====================================================
  // APPLICATION STATUS CLASSIFICATION
  // =====================================================

  const getApplicationStatus = (application) => {
    return String(
      application?.status || "Pending"
    )
      .toLowerCase()
      .trim();
  };

  // =====================================================
  // FETCH EVERYTHING
  // =====================================================

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------
      // USER
      // -----------------------------------------------

      const loggedInUser = getLoggedInUser();

      if (!loggedInUser) {
        setError(
          "User session not found. Please login again."
        );

        return;
      }

      if (!loggedInUser.id) {
        setError(
          "User ID not found. Please login again."
        );

        return;
      }

      setUser(loggedInUser);

      // -----------------------------------------------
      // LATEST PROFILE
      // -----------------------------------------------

      const latestUser = await fetchLatestProfile(
        loggedInUser
      );

      const email =
        latestUser?.email ||
        loggedInUser?.email ||
        "";

      if (!email) {
        setError(
          "User email not found. Please login again."
        );

        return;
      }

      // -----------------------------------------------
      // FETCH ALL DATA
      // -----------------------------------------------

      const [
        dashboardData,
        applications,
        savedJobs,
        interviews,
        recentJobs,
      ] = await Promise.all([
        fetchDashboardStats(email),
        fetchApplications(email),
        fetchSavedJobs(email),
        fetchInterviews(email),
        fetchRecentJobs(),
      ]);

      console.log("FINAL DASHBOARD DATA", {
        dashboardData,
        applications,
        savedJobs,
        interviews,
        recentJobs,
      });

      // -----------------------------------------------
      // BACKEND STATS
      // -----------------------------------------------

      const stats =
        dashboardData?.stats || {};

      // -----------------------------------------------
      // APPLICATION STATUS
      // -----------------------------------------------

      const appliedCount = applications.length;

      let shortlistedCount = 0;
      let interviewCount = 0;
      let rejectedCount = 0;

      applications.forEach((application) => {
        const status =
          getApplicationStatus(application);

        if (
          status === "shortlisted" ||
          status === "accepted"
        ) {
          shortlistedCount++;
        }

        if (
          status === "interview" ||
          status === "scheduled"
        ) {
          interviewCount++;
        }

        if (status === "rejected") {
          rejectedCount++;
        }
      });

      // -----------------------------------------------
      // UPCOMING INTERVIEWS
      // -----------------------------------------------

      const upcomingInterviewList =
        interviews
          .filter(isUpcomingInterview)
          .sort((a, b) => {
            const dateA = new Date(
              getInterviewDate(a)
            );

            const dateB = new Date(
              getInterviewDate(b)
            );

            return dateA - dateB;
          });

      // -----------------------------------------------
      // PROFILE COMPLETION
      // -----------------------------------------------

      const profileCompletion =
        calculateProfileCompletion(
          latestUser
        );

      // -----------------------------------------------
      // UPDATE DASHBOARD
      // -----------------------------------------------

      setDashboard({
        totalApplications: Number(
          stats.totalApplications ??
            applications.length
        ),

        savedJobs: Number(
          stats.savedJobs ??
            savedJobs.length
        ),

        upcomingInterviews:
          upcomingInterviewList.length,

        profileCompletion,

        recentJobs,

        recentApplications:
          applications.slice(0, 5),

        upcomingInterviewList:
          upcomingInterviewList.slice(0, 5),

        savedJobList:
          savedJobs.slice(0, 5),

        applicationStatus: {
          applied: appliedCount,
          shortlisted: shortlistedCount,
          interview: interviewCount,
          rejected: rejectedCount,
        },
      });

      setError("");
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // APPLY FOR JOB
  // =====================================================

  const handleApply = async (job) => {
    try {
      const loggedInUser =
        getLoggedInUser();

      if (!loggedInUser) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      if (!loggedInUser.id) {
        alert(
          "User ID not found. Please login again."
        );

        navigate("/login");

        return;
      }

      const jobId =
        job?.id || job?.job_id;

      if (!jobId) {
        alert("Job ID is missing.");
        return;
      }

      setApplyingJobId(jobId);

      // -----------------------------------------------
      // GET LATEST PROFILE
      // -----------------------------------------------

      const profileUser =
        await fetchLatestProfile(
          loggedInUser
        );

      const applicantId =
        profileUser?.id ||
        loggedInUser?.id;

      const applicantName =
        profileUser?.fullname ||
        profileUser?.name ||
        loggedInUser?.fullname ||
        loggedInUser?.name ||
        "";

      const applicantEmail =
        profileUser?.email ||
        loggedInUser?.email ||
        "";

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (!applicantId) {
        alert(
          "User ID not found. Please login again."
        );

        navigate("/login");

        return;
      }

      if (!applicantName.trim()) {
        alert(
          "Applicant name is required. Please complete your profile first."
        );

        navigate(
          "/job-seeker/profile"
        );

        return;
      }

      if (!applicantEmail.trim()) {
        alert(
          "Applicant email is required. Please complete your profile first."
        );

        navigate(
          "/job-seeker/profile"
        );

        return;
      }

      // -----------------------------------------------
      // APPLY API
      // -----------------------------------------------

      const data = await apiRequest(
        `${API_URL}/api/jobseeker/apply`,
        {
          method: "POST",

          body: JSON.stringify({
            job_id: jobId,

            applicant_id: applicantId,

            applicant_name:
              applicantName.trim(),

            applicantName:
              applicantName.trim(),

            email:
              applicantEmail.trim(),

            applicant_email:
              applicantEmail.trim(),

            applicantEmail:
              applicantEmail.trim(),
          }),
        }
      );

      console.log(
        "Apply response:",
        data
      );

      alert(
        data.message ||
          "Application submitted successfully!"
      );

      // -----------------------------------------------
      // REFRESH DASHBOARD
      // -----------------------------------------------

      await fetchDashboard();
    } catch (error) {
      console.error(
        "Apply error:",
        error
      );

      alert(
        error.message ||
          "Unable to apply. Please check whether the backend server is running."
      );
    } finally {
      setApplyingJobId(null);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    navigate("/login");
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="jobseeker-dashboard loading-screen">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="jobseeker-dashboard error-screen">
        <h2>{error}</h2>

        <button onClick={fetchDashboard}>
          Try Again
        </button>

        <button
          onClick={() =>
            navigate("/login")
          }
          style={{
            marginLeft: "10px",
          }}
        >
          Login Again
        </button>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="jobseeker-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>
          <h1>
            Welcome back,{" "}
            {user?.fullname ||
              user?.name ||
              "Job Seeker"}
          </h1>

          <p>
            Find your next opportunity
            and manage your career.
          </p>
        </div>

        <button
          className="find-job-btn"
          onClick={() =>
            navigate(
              "/job-seeker/find-jobs"
            )
          }
        >
          Find Jobs
        </button>

      </div>

      {/* =================================================
          LOGGED IN USER
      ================================================= */}

      <div
        style={{
          marginBottom: "20px",
          padding: "15px 20px",
          background: "#ffffff",
          borderRadius: "10px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <strong>
          Logged in as:
        </strong>{" "}
        {user?.email ||
          "Email not available"}
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="dashboard-stats">

        <div className="stat-card">
          <span>
            Total Applications
          </span>

          <h2>
            {dashboard.totalApplications}
          </h2>
        </div>

        <div className="stat-card">
          <span>
            Saved Jobs
          </span>

          <h2>
            {dashboard.savedJobs}
          </h2>
        </div>

        <div className="stat-card">
          <span>
            Upcoming Interviews
          </span>

          <h2>
            {dashboard.upcomingInterviews}
          </h2>
        </div>

        <div className="stat-card">
          <span>
            Profile Completion
          </span>

          <h2>
            {dashboard.profileCompletion}%
          </h2>
        </div>

      </div>

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="dashboard-grid">

        {/* =================================================
            RECENT JOBS
        ================================================= */}

        <div className="dashboard-box recent-jobs-box">

          <div className="box-header">

            <div>
              <h2>Recent Jobs</h2>

              <p>
                Latest job opportunities
              </p>
            </div>

            <button
              className="view-all-btn"
              onClick={() =>
                navigate(
                  "/job-seeker/find-jobs"
                )
              }
            >
              View All
            </button>

          </div>

          <div className="jobs-grid">

            {dashboard.recentJobs.length >
            0 ? (

              dashboard.recentJobs.map(
                (job) => {
                  const jobId =
                    job.id ||
                    job.job_id;

                  return (
                    <div
                      className="job-card"
                      key={jobId}
                    >

                      <div className="job-card-content">

                        <h3>
                          {job.title ||
                            job.job_title ||
                            "Untitled Job"}
                        </h3>

                        <p className="job-company">
                          {job.company ||
                            job.company_name ||
                            "Company"}
                        </p>

                        <p className="job-location">
                          Location:{" "}
                          {job.location ||
                            "Not specified"}
                        </p>

                        <p className="job-salary">
                          {job.salary ||
                            job.salary_range ||
                            "Salary not specified"}
                        </p>

                      </div>

                      <button
                        className="apply-btn"
                        disabled={
                          applyingJobId ===
                          jobId
                        }
                        onClick={() =>
                          handleApply(job)
                        }
                      >
                        {applyingJobId ===
                        jobId
                          ? "Applying..."
                          : "Apply"}
                      </button>

                    </div>
                  );
                }
              )

            ) : (

              <div className="no-jobs">

                <p>
                  No recent jobs
                  available.
                </p>

                <button
                  className="view-all-btn"
                  onClick={() =>
                    navigate(
                      "/job-seeker/find-jobs"
                    )
                  }
                >
                  Find Jobs
                </button>

              </div>

            )}

          </div>

        </div>

        {/* =================================================
            APPLICATION STATUS
        ================================================= */}

        <div className="dashboard-box">

          <div className="box-header">

            <div>
              <h2>
                Application Status
              </h2>

              <p>
                Track your applications
              </p>
            </div>

            <button
              className="view-all-btn"
              onClick={() =>
                navigate(
                  "/job-seeker/applications"
                )
              }
            >
              View All
            </button>

          </div>

          <div className="status-list">

            <div className="status-row">
              <span>Applied</span>

              <strong className="blue">
                {
                  dashboard
                    .applicationStatus
                    .applied
                }
              </strong>
            </div>

            <div className="status-row">
              <span>
                Shortlisted
              </span>

              <strong className="green">
                {
                  dashboard
                    .applicationStatus
                    .shortlisted
                }
              </strong>
            </div>

            <div className="status-row">
              <span>Interview</span>

              <strong className="orange">
                {
                  dashboard
                    .applicationStatus
                    .interview
                }
              </strong>
            </div>

            <div className="status-row">
              <span>Rejected</span>

              <strong className="red">
                {
                  dashboard
                    .applicationStatus
                    .rejected
                }
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          RECENT APPLICATIONS
      ================================================= */}

      <div
        className="dashboard-box"
        style={{
          marginTop: "25px",
        }}
      >

        <div className="box-header">

          <div>
            <h2>
              Recent Applications
            </h2>

            <p>
              Your latest job applications
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate(
                "/job-seeker/applications"
              )
            }
          >
            View All
          </button>

        </div>

        {dashboard.recentApplications
          .length > 0 ? (

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >

            {dashboard.recentApplications.map(
              (application) => {

                const status =
                  getApplicationStatus(
                    application
                  );

                return (
                  <div
                    key={
                      application.id ||
                      application.application_id ||
                      `${application.job_id}-${application.applied_at}`
                    }
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      padding: "16px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "10px",
                      background:
                        "#ffffff",
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          margin:
                            "0 0 5px",
                        }}
                      >
                        {application.job_title ||
                          application.title ||
                          application.position ||
                          "Job Application"}
                      </h3>

                      <p
                        style={{
                          margin: "0",
                          color: "#64748b",
                        }}
                      >
                        {application.company ||
                          application.company_name ||
                          "Company"}
                      </p>

                      <p
                        style={{
                          margin:
                            "5px 0 0",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        Applied on:{" "}
                        {application.applied_at
                          ? new Date(
                              application.applied_at
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                    </div>

                    <span
                      style={{
                        padding:
                          "7px 14px",
                        borderRadius:
                          "20px",
                        fontSize: "13px",
                        fontWeight: "600",

                        background:
                          status ===
                          "rejected"
                            ? "#fee2e2"
                            : status ===
                              "interview" ||
                              status ===
                                "scheduled"
                            ? "#fef3c7"
                            : status ===
                                "accepted" ||
                              status ===
                                "shortlisted"
                            ? "#dcfce7"
                            : "#dbeafe",

                        color:
                          status ===
                          "rejected"
                            ? "#dc2626"
                            : status ===
                              "interview" ||
                              status ===
                                "scheduled"
                            ? "#d97706"
                            : status ===
                                "accepted" ||
                              status ===
                                "shortlisted"
                            ? "#16a34a"
                            : "#2563eb",
                      }}
                    >
                      {application.status ||
                        "Pending"}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="no-jobs">

            <p>
              You have not applied
              for any jobs yet.
            </p>

            <button
              className="view-all-btn"
              onClick={() =>
                navigate(
                  "/job-seeker/find-jobs"
                )
              }
            >
              Find Jobs
            </button>

          </div>

        )}

      </div>

      {/* =================================================
          UPCOMING INTERVIEWS
      ================================================= */}

      <div
        className="dashboard-box"
        style={{
          marginTop: "25px",
        }}
      >

        <div className="box-header">

          <div>
            <h2>
              Upcoming Interviews
            </h2>

            <p>
              Your scheduled interviews
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate(
                "/job-seeker/interviews"
              )
            }
          >
            View All
          </button>

        </div>

        {dashboard.upcomingInterviewList
          .length > 0 ? (

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >

            {dashboard.upcomingInterviewList.map(
              (interview, index) => {

                const interviewDate =
                  getInterviewDate(
                    interview
                  );

                const interviewTime =
                  getInterviewTime(
                    interview
                  );

                return (
                  <div
                    key={
                      interview.id ||
                      interview.interview_id ||
                      index
                    }
                    style={{
                      padding: "18px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "10px",
                      background:
                        "#fff7ed",
                    }}
                  >

                    <h3
                      style={{
                        margin:
                          "0 0 7px",
                      }}
                    >
                      {interview.job_title ||
                        interview.title ||
                        interview.position ||
                        "Interview"}
                    </h3>

                    <p
                      style={{
                        margin:
                          "0 0 5px",
                        color: "#64748b",
                      }}
                    >
                      {interview.company ||
                        interview.company_name ||
                        "Company"}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                      }}
                    >
                      <strong>
                        Date:
                      </strong>{" "}
                      {interviewDate
                        ? new Date(
                            interviewDate
                          ).toLocaleDateString()
                        : "Not specified"}
                    </p>

                    {interviewTime && (
                      <p
                        style={{
                          margin:
                            "5px 0 0",
                          color:
                            "#475569",
                        }}
                      >
                        <strong>
                          Time:
                        </strong>{" "}
                        {interviewTime}
                      </p>
                    )}

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="no-jobs">

            <p>
              No upcoming interviews.
            </p>

          </div>

        )}

      </div>

      {/* =================================================
          SAVED JOBS
      ================================================= */}

      <div
        className="dashboard-box"
        style={{
          marginTop: "25px",
        }}
      >

        <div className="box-header">

          <div>
            <h2>Saved Jobs</h2>

            <p>
              Jobs you saved for later
            </p>
          </div>

          <button
            className="view-all-btn"
            onClick={() =>
              navigate(
                "/job-seeker/saved-jobs"
              )
            }
          >
            View All
          </button>

        </div>

        {dashboard.savedJobList.length >
        0 ? (

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >

            {dashboard.savedJobList.map(
              (job, index) => {

                const jobId =
                  job.id ||
                  job.job_id ||
                  index;

                return (
                  <div
                    key={jobId}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      padding: "16px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: "10px",
                      background:
                        "#eff6ff",
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          margin:
                            "0 0 5px",
                        }}
                      >
                        {job.title ||
                          job.job_title ||
                          "Saved Job"}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                        }}
                      >
                        {job.company ||
                          job.company_name ||
                          "Company"}
                      </p>

                    </div>

                    <button
                      className="view-all-btn"
                      onClick={() =>
                        navigate(
                          "/job-seeker/saved-jobs"
                        )
                      }
                    >
                      View
                    </button>

                  </div>
                );
              }
            )}

          </div>

        ) : (

          <div className="no-jobs">

            <p>
              No saved jobs yet.
            </p>

            <button
              className="view-all-btn"
              onClick={() =>
                navigate(
                  "/job-seeker/find-jobs"
                )
              }
            >
              Find Jobs
            </button>

          </div>

        )}

      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <div className="quick-actions">

        <h2>Quick Actions</h2>

        <div className="quick-action-grid">

          {/* RESUME */}

          <div
            className="quick-card"
            onClick={() =>
              navigate(
                "/job-seeker/resume"
              )
            }
          >
            <h3>
              Upload Resume
            </h3>

            <p>
              Keep your resume
              updated
            </p>
          </div>

          {/* ASSESSMENT */}

          
          {/* NOTIFICATIONS */}

          <div
            className="quick-card"
            onClick={() =>
              navigate(
                "/job-seeker/notifications"
              )
            }
          >
            <h3>
              Notifications
            </h3>

            <p>
              Check your latest
              updates
            </p>
          </div>

          {/* PROFILE */}

          <div
            className="quick-card"
            onClick={() =>
              navigate(
                "/job-seeker/profile"
              )
            }
          >
            <h3>
              My Profile
            </h3>

            <p>
              Update your
              information
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default JobSeeker;