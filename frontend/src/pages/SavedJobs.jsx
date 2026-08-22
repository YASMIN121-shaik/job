import React, { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaBuilding,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaBriefcase,
  FaClock,
  FaEye,
  FaTrash,
  FaBookmark,
  FaTimes,
  FaLayerGroup,
  FaFileAlt,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";

import "./SavedJobs.css";

const API_URL = "http://localhost:5000";

function SavedJobs() {
  // =====================================================
  // STATES
  // =====================================================

  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);

  const [removingJobId, setRemovingJobId] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return {};
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error reading logged-in user:", error);
      return {};
    }
  };

  // =====================================================
  // GET USER
  // =====================================================

  const user = getLoggedInUser();

  const userEmail = user?.email || "";

  const userName =
    user?.fullname ||
    user?.name ||
    user?.username ||
    "User";

  // =====================================================
  // NORMALIZE JOB
  // =====================================================

  const normalizeJob = (job) => {
    return {
      ...job,

      id:
        job.id ||
        job.job_id ||
        job.jobId,

      job_id:
        job.job_id ||
        job.jobId ||
        job.id,

      title:
        job.title ||
        job.job_title ||
        job.jobTitle ||
        "Untitled Job",

      company:
        job.company ||
        job.company_name ||
        job.companyName ||
        "Company not specified",

      location:
        job.location ||
        job.job_location ||
        job.city ||
        "Location not specified",

      salary:
        job.salary ||
        job.salary_range ||
        job.salaryRange ||
        "Salary not specified",

      job_type:
        job.job_type ||
        job.jobType ||
        job.type ||
        "Full Time",

      experience:
        job.experience ||
        job.experience_required ||
        job.experienceRequired ||
        "Fresher",

      work_mode:
        job.work_mode ||
        job.workMode ||
        job.mode ||
        "On-site",

      category:
        job.category ||
        job.job_category ||
        job.jobCategory ||
        "Not specified",

      department:
        job.department ||
        job.job_department ||
        job.jobDepartment ||
        "Not specified",

      description:
        job.description ||
        job.job_description ||
        job.jobDescription ||
        job.details ||
        job.job_details ||
        "",

      skills:
        job.skills ||
        job.required_skills ||
        job.requiredSkills ||
        "",

      last_date:
        job.last_date ||
        job.lastDate ||
        job.application_deadline ||
        job.applicationDeadline ||
        null,

      created_at:
        job.created_at ||
        job.createdAt ||
        job.posted_at ||
        job.postedAt ||
        null,

      saved_at:
        job.saved_at ||
        job.savedAt ||
        null,

      saved_id:
        job.saved_id ||
        job.savedId ||
        null,
    };
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!userEmail) {
      setError(
        "User information not found. Please login again."
      );

      setLoading(false);

      return;
    }

    fetchSavedJobs();
  }, [userEmail]);

  // =====================================================
  // FETCH SAVED JOBS
  // =====================================================

  const fetchSavedJobs = async () => {
    if (!userEmail) {
      setError("User email not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/jobseeker/saved-jobs?email=${encodeURIComponent(
          userEmail
        )}`
      );

      const data = await response.json();

      console.log("Saved jobs from backend:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to fetch saved jobs (${response.status})`
        );
      }

      const jobs = Array.isArray(data)
        ? data
        : Array.isArray(data.savedJobs)
        ? data.savedJobs
        : Array.isArray(data.saved_jobs)
        ? data.saved_jobs
        : Array.isArray(data.jobs)
        ? data.jobs
        : Array.isArray(data.data)
        ? data.data
        : [];

      const normalizedJobs = jobs
        .map(normalizeJob)
        .filter(
          (job) =>
            job.id !== undefined &&
            job.id !== null &&
            !isNaN(Number(job.id))
        );

      console.log(
        "Normalized saved jobs:",
        normalizedJobs
      );

      setSavedJobs(normalizedJobs);
    } catch (error) {
      console.error(
        "Fetch saved jobs error:",
        error
      );

      setError(
        error.message ||
          "Unable to load saved jobs from server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REMOVE SAVED JOB
  // =====================================================

  const removeJob = async (jobId) => {
    if (!userEmail) {
      alert(
        "Your login session is missing. Please login again."
      );

      return;
    }

    const numericJobId = Number(jobId);

    if (!numericJobId || isNaN(numericJobId)) {
      alert("Invalid job ID.");
      return;
    }

    try {
      setRemovingJobId(numericJobId);

      console.log(
        "Removing saved job:",
        numericJobId
      );

      const response = await fetch(
        `${API_URL}/api/jobseeker/saved-jobs`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: userEmail,
            job_id: numericJobId,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Remove saved job response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to remove saved job (${response.status})`
        );
      }

      // =================================================
      // REMOVE FROM UI
      // =================================================

      setSavedJobs((prev) =>
        prev.filter(
          (job) =>
            Number(
              job.job_id ||
                job.id ||
                job.jobId
            ) !== numericJobId
        )
      );

      // =================================================
      // CLOSE MODAL
      // =================================================

      if (
        selectedJob &&
        Number(
          selectedJob.job_id ||
            selectedJob.id ||
            selectedJob.jobId
        ) === numericJobId
      ) {
        setSelectedJob(null);
      }

      alert(
        data.message ||
          "Job removed from saved jobs."
      );
    } catch (error) {
      console.error(
        "Remove saved job error:",
        error
      );

      alert(
        error.message ||
          "Unable to remove saved job. Please check your backend route."
      );
    } finally {
      setRemovingJobId(null);
    }
  };

  // =====================================================
  // APPLY FOR SAVED JOB
  // =====================================================

  const handleApply = async (job) => {
    if (!job) {
      alert("Invalid job.");
      return;
    }

    const jobId = Number(
      job.job_id ||
        job.id ||
        job.jobId
    );

    if (!jobId || isNaN(jobId)) {
      alert("Invalid job ID.");
      return;
    }

    if (!userEmail) {
      alert(
        "Your login session is missing. Please login again."
      );

      return;
    }

    try {
      setApplyingJobId(jobId);

      const currentUser = getLoggedInUser();

      const applicantId =
        currentUser.id ||
        currentUser.user_id ||
        currentUser.userId ||
        "";

      const applicantName =
        currentUser.fullname ||
        currentUser.name ||
        currentUser.username ||
        userName ||
        "";

      const applicantEmail =
        currentUser.email ||
        userEmail ||
        "";

      if (!applicantName.trim()) {
        alert(
          "Applicant name is required. Please complete your profile."
        );

        return;
      }

      if (!applicantEmail.trim()) {
        alert(
          "Applicant email is required. Please login again."
        );

        return;
      }

      console.log(
        "Submitting saved job application:",
        {
          job_id: jobId,
          applicant_id: applicantId,
          applicant_name: applicantName,
          email: applicantEmail,
        }
      );

      const response = await fetch(
        `${API_URL}/api/jobseeker/apply`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            job_id: jobId,

            applicant_id: applicantId,

            applicantName:
              applicantName.trim(),

            applicant_name:
              applicantName.trim(),

            applicantEmail:
              applicantEmail.trim(),

            applicant_email:
              applicantEmail.trim(),

            email:
              applicantEmail.trim(),

            phone:
              currentUser.phone || "",

            experience:
              currentUser.experience ||
              job.experience ||
              "Fresher",

            resume:
              currentUser.resume || "",

            status: "Applied",
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Apply response:",
        data
      );

      // =================================================
      // ALREADY APPLIED
      // =================================================

      if (response.status === 409) {
        alert(
          data.message ||
            "You have already applied for this job."
        );

        return;
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (!response.ok) {
        alert(
          data.message ||
            data.error ||
            "Failed to apply for this job."
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        data.message ||
          `Application submitted successfully for ${
            job.title || "this job"
          }!`
      );
    } catch (error) {
      console.error(
        "Apply saved job error:",
        error
      );

      alert(
        error.message ||
          "Unable to apply for this job. Please check your backend server."
      );
    } finally {
      setApplyingJobId(null);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredJobs = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    if (!searchText) {
      return savedJobs;
    }

    return savedJobs.filter((job) => {
      const title = String(
        job.title || ""
      ).toLowerCase();

      const company = String(
        job.company || ""
      ).toLowerCase();

      const location = String(
        job.location || ""
      ).toLowerCase();

      const skills = String(
        job.skills || ""
      ).toLowerCase();

      const description = String(
        job.description || ""
      ).toLowerCase();

      const category = String(
        job.category || ""
      ).toLowerCase();

      return (
        title.includes(searchText) ||
        company.includes(searchText) ||
        location.includes(searchText) ||
        skills.includes(searchText) ||
        description.includes(searchText) ||
        category.includes(searchText)
      );
    });
  }, [savedJobs, search]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="saved-jobs-page">
        <div className="jobs-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading saved jobs...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="saved-jobs-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="saved-page-header">

        <div>
          <h1>
            Saved Jobs
          </h1>

          <p>
            Jobs you saved for later
          </p>
        </div>

        <div className="saved-count">

          <FaBookmark />

          <strong>
            {savedJobs.length}
          </strong>

          <span>
            Saved Jobs
          </span>

        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="saved-search-box">

        <FaSearch />

        <input
          type="text"
          placeholder="Search your saved jobs..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {search && (
          <button
            type="button"
            className="saved-search-clear"
            onClick={() =>
              setSearch("")
            }
          >
            <FaTimes />
          </button>
        )}

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error ? (

        <div className="no-saved-jobs">

          <FaTimes />

          <h2>
            Unable to load saved jobs
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchSavedJobs}
          >
            Try Again
          </button>

        </div>

      ) : (

        <div className="saved-job-list">

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredJobs.length === 0 ? (

            <div className="no-saved-jobs">

              <FaBookmark />

              <h2>
                {search
                  ? "No saved jobs found"
                  : "No saved jobs yet"}
              </h2>

              <p>
                {search
                  ? "Try searching for another job."
                  : "Save jobs from Find Jobs and they will appear here."}
              </p>

            </div>

          ) : (

            /* =================================================
               JOB LIST
            ================================================= */

            filteredJobs.map((job) => {

              const skills =
                String(
                  job.skills || ""
                )
                  .split(",")
                  .map((skill) =>
                    skill.trim()
                  )
                  .filter(Boolean);

              const jobId = Number(
                job.job_id ||
                  job.id ||
                  job.jobId
              );

              const isRemoving =
                removingJobId === jobId;

              const isApplying =
                applyingJobId === jobId;

              return (

                <article
                  className="saved-job-card"
                  key={
                    job.saved_id ||
                    `${jobId}-${job.saved_at || ""}`
                  }
                >

                  {/* =================================================
                      COMPANY ICON
                  ================================================= */}

                  <div className="saved-company-icon">
                    <FaBuilding />
                  </div>

                  {/* =================================================
                      JOB INFORMATION
                  ================================================= */}

                  <div className="saved-job-content">

                    <h2>
                      {job.title}
                    </h2>

                    <p className="saved-company">
                      {job.company}
                    </p>

                    {/* META */}

                    <div className="saved-meta">

                      <span>
                        <FaMapMarkerAlt />
                        {job.location}
                      </span>

                      <span>
                        <FaRupeeSign />
                        {job.salary}
                      </span>

                      <span>
                        <FaBriefcase />
                        {job.job_type}
                      </span>

                      <span>
                        <FaUsers />
                        {job.experience}
                      </span>

                    </div>

                    {/* WORK MODE */}

                    <div className="saved-meta">

                      <span>
                        {job.work_mode}
                      </span>

                      <span>
                        {job.category}
                      </span>

                    </div>

                    {/* SKILLS */}

                    {skills.length > 0 && (

                      <div className="saved-skills">

                        {skills
                          .slice(0, 6)
                          .map(
                            (
                              skill,
                              index
                            ) => (

                              <span
                                key={`${skill}-${index}`}
                              >
                                {skill}
                              </span>

                            )
                          )}

                      </div>

                    )}

                    {/* SAVED TIME */}

                    <div className="saved-time">

                      <FaClock />

                      Saved{" "}

                      {job.saved_at
                        ? new Date(
                            job.saved_at
                          ).toLocaleDateString()
                        : "Recently"}

                    </div>

                  </div>

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="saved-actions">

                    {/* VIEW DETAILS */}

                    <button
                      type="button"
                      className="details-btn"
                      onClick={() =>
                        setSelectedJob(job)
                      }
                    >

                      <FaEye />

                      <span>
                        View Details
                      </span>

                    </button>

                    {/* APPLY */}

                    <button
                      type="button"
                      className="apply-btn"
                      disabled={isApplying}
                      onClick={() =>
                        handleApply(job)
                      }
                    >

                      {isApplying
                        ? "Applying..."
                        : "Apply Now"}

                    </button>

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="remove-btn"
                      disabled={isRemoving}
                      onClick={() =>
                        removeJob(jobId)
                      }
                    >

                      <FaTrash />

                      {isRemoving
                        ? "Removing..."
                        : "Remove"}

                    </button>

                  </div>

                </article>

              );
            })

          )}

        </div>

      )}

      {/* =====================================================
          JOB DETAILS MODAL
      ===================================================== */}

      {selectedJob && (

        <div
          className="job-modal-overlay"
          onClick={() =>
            setSelectedJob(null)
          }
        >

          <div
            className="job-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="modal-close-btn"
              onClick={() =>
                setSelectedJob(null)
              }
              title="Close"
            >
              <FaTimes />
            </button>

            {/* COMPANY ICON */}

            <div className="modal-company-icon">
              <FaBuilding />
            </div>

            {/* TITLE */}

            <h2>
              {selectedJob.title}
            </h2>

            {/* COMPANY */}

            <p className="modal-company">
              {selectedJob.company}
            </p>

            {/* INFO */}

            <div className="modal-info-grid">

              <div>
                <FaMapMarkerAlt />

                <span>
                  {selectedJob.location}
                </span>
              </div>

              <div>
                <FaRupeeSign />

                <span>
                  {selectedJob.salary}
                </span>
              </div>

              <div>
                <FaBriefcase />

                <span>
                  {selectedJob.job_type}
                </span>
              </div>

              <div>
                <FaUsers />

                <span>
                  {selectedJob.experience}
                </span>
              </div>

              <div>
                <FaLayerGroup />

                <span>
                  {selectedJob.category}
                </span>
              </div>

              <div>
                <FaBuilding />

                <span>
                  {selectedJob.department}
                </span>
              </div>

              <div>
                <FaCalendarAlt />

                <span>
                  {selectedJob.last_date
                    ? new Date(
                        selectedJob.last_date
                      ).toLocaleDateString()
                    : "Not specified"}
                </span>
              </div>

            </div>

            {/* WORK MODE */}

            <div className="modal-section">

              <h4>
                Work Mode
              </h4>

              <p>
                {selectedJob.work_mode}
              </p>

            </div>

            {/* DESCRIPTION */}

            <div className="modal-section">

              <h4>
                <FaFileAlt />
                Job Description
              </h4>

              <div className="job-description-content">

                {selectedJob.description &&
                selectedJob.description.trim() ? (

                  <p>
                    {selectedJob.description}
                  </p>

                ) : (

                  <p className="no-description">
                    No job description provided
                    by the employer.
                  </p>

                )}

              </div>

            </div>

            {/* SKILLS */}

            <div className="modal-section">

              <h4>
                Skills
              </h4>

              <div className="modal-skills">

                {String(
                  selectedJob.skills || ""
                )
                  .split(",")
                  .map((skill) =>
                    skill.trim()
                  )
                  .filter(Boolean)
                  .map(
                    (
                      skill,
                      index
                    ) => (

                      <span
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>

                    )
                  )}

              </div>

            </div>

            {/* APPLY */}

            <button
              type="button"
              className="modal-apply-btn"
              disabled={
                applyingJobId ===
                Number(
                  selectedJob.job_id ||
                    selectedJob.id ||
                    selectedJob.jobId
                )
              }
              onClick={() =>
                handleApply(selectedJob)
              }
            >

              {applyingJobId ===
              Number(
                selectedJob.job_id ||
                  selectedJob.id ||
                  selectedJob.jobId
              )
                ? "Applying..."
                : "Apply Now"}

            </button>

            {/* REMOVE */}

            <button
              type="button"
              className="modal-remove-btn"
              disabled={
                removingJobId ===
                Number(
                  selectedJob.job_id ||
                    selectedJob.id ||
                    selectedJob.jobId
                )
              }
              onClick={() =>
                removeJob(
                  Number(
                    selectedJob.job_id ||
                      selectedJob.id ||
                      selectedJob.jobId
                  )
                )
              }
            >

              <FaTrash />

              {removingJobId ===
              Number(
                selectedJob.job_id ||
                  selectedJob.id ||
                  selectedJob.jobId
              )
                ? "Removing..."
                : "Remove Saved Job"}

            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default SavedJobs;