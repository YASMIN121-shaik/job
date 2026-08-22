import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaSearch,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaBuilding,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";

import "./JobHolderJobs.css";

function JobHolderJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* =====================================================
     FETCH JOBS
  ===================================================== */

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/jobs"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.jobs || [];

      setJobs(data);
      setFilteredJobs(data);

    } catch (err) {
      console.error("Fetch jobs error:", err);

      setError(
        err.response?.data?.error ||
        "Unable to load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);


  /* =====================================================
     FILTER JOBS
  ===================================================== */

  useEffect(() => {
    let result = [...jobs];

    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((job) => {
        return (
          String(job.jobTitle || "")
            .toLowerCase()
            .includes(searchValue) ||

          String(job.companyName || "")
            .toLowerCase()
            .includes(searchValue) ||

          String(job.location || "")
            .toLowerCase()
            .includes(searchValue) ||

          String(job.category || "")
            .toLowerCase()
            .includes(searchValue)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (job) =>
          String(job.status || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    setFilteredJobs(result);
  }, [search, statusFilter, jobs]);


  /* =====================================================
     DELETE JOB
  ===================================================== */

  const handleDelete = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/jobs/${jobId}`
      );

      setJobs((prevJobs) =>
        prevJobs.filter(
          (job) =>
            (job.id || job._id) !== jobId
        )
      );

    } catch (err) {
      console.error("Delete job error:", err);

      alert(
        err.response?.data?.error ||
        "Unable to delete the job."
      );
    }
  };


  /* =====================================================
     EDIT JOB
  ===================================================== */

  const handleEdit = (jobId) => {
    navigate(`/jobholder/edit-job/${jobId}`);
  };


  /* =====================================================
     VIEW JOB
  ===================================================== */

  const handleView = (jobId) => {
    navigate(`/jobholder/jobs/${jobId}`);
  };


  /* =====================================================
     CREATE JOB
  ===================================================== */

  const handleCreateJob = () => {
    navigate("/jobholder/create-job");
  };


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

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


  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    const value = String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (
      value === "open" ||
      value === "approved" ||
      value === "active"
    ) {
      return "jh-job-status-open";
    }

    if (
      value === "closed" ||
      value === "rejected"
    ) {
      return "jh-job-status-closed";
    }

    return "jh-job-status-pending";
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="jh-jobs-page">

        <div className="jh-jobs-loading">

          <div className="jh-loading-spinner"></div>

          <p>Loading your jobs...</p>

        </div>

      </div>
    );
  }


  return (
    <div className="jh-jobs-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="jh-jobs-header">

        <div className="jh-jobs-heading">

          <div className="jh-jobs-heading-icon">
            <FaBriefcase />
          </div>

          <div>
            <h1>My Jobs</h1>

            <p>
              Manage and track all your job postings.
            </p>
          </div>

        </div>


        <button
          className="jh-create-job-btn"
          onClick={handleCreateJob}
        >
          <FaPlus />
          Create Job
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="jh-jobs-error">
          {error}
        </div>
      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="jh-jobs-stats">

        <div className="jh-job-stat-card">

          <div className="jh-stat-icon total">
            <FaBriefcase />
          </div>

          <div>
            <span>Total Jobs</span>
            <strong>{jobs.length}</strong>
          </div>

        </div>


        <div className="jh-job-stat-card">

          <div className="jh-stat-icon open">
            <FaEye />
          </div>

          <div>
            <span>Open Jobs</span>

            <strong>
              {
                jobs.filter(
                  (job) =>
                    String(job.status || "")
                      .toLowerCase() === "open"
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="jh-job-stat-card">

          <div className="jh-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Pending</span>

            <strong>
              {
                jobs.filter(
                  (job) =>
                    String(job.status || "")
                      .toLowerCase() === "pending"
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="jh-job-stat-card">

          <div className="jh-stat-icon closed">
            <FaUsers />
          </div>

          <div>
            <span>Total Applicants</span>

            <strong>
              {
                jobs.reduce(
                  (total, job) =>
                    total +
                    Number(
                      job.applicantsCount ||
                      job.applicant_count ||
                      0
                    ),
                  0
                )
              }
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="jh-jobs-filter">

        <div className="jh-search-box">

          <FaSearch />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search jobs, company, location..."
          />

        </div>


        <div className="jh-status-filter">

          <FaFilter />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Open">
              Open
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Closed">
              Closed
            </option>

            <option value="Rejected">
              Rejected
            </option>

          </select>

        </div>

      </div>


      {/* =================================================
          RESULTS COUNT
      ================================================= */}

      <div className="jh-results-row">

        <span>
          Showing{" "}
          <strong>{filteredJobs.length}</strong>{" "}
          {filteredJobs.length === 1
            ? "job"
            : "jobs"}
        </span>

      </div>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {filteredJobs.length === 0 ? (

        <div className="jh-empty-jobs">

          <div className="jh-empty-icon">
            <FaBriefcase />
          </div>

          <h2>
            {jobs.length === 0
              ? "No Jobs Created Yet"
              : "No Jobs Found"}
          </h2>

          <p>
            {jobs.length === 0
              ? "Create your first job posting to start receiving applications."
              : "Try changing your search or filter."}
          </p>

          {jobs.length === 0 && (
            <button
              className="jh-empty-create-btn"
              onClick={handleCreateJob}
            >
              <FaPlus />
              Create Your First Job
            </button>
          )}

        </div>

      ) : (

        /* =================================================
           JOB GRID
        ================================================= */

        <div className="jh-jobs-grid">

          {filteredJobs.map((job) => {

            const jobId = job.id || job._id;

            return (
              <div
                className="jh-job-card"
                key={jobId}
              >

                {/* CARD TOP */}

                <div className="jh-job-card-top">

                  <div className="jh-job-icon">
                    <FaBriefcase />
                  </div>

                  <span
                    className={`jh-job-status ${getStatusClass(
                      job.status
                    )}`}
                  >
                    {job.status || "Pending"}
                  </span>

                </div>


                {/* TITLE */}

                <h2>
                  {job.jobTitle ||
                    job.title ||
                    "Untitled Job"}
                </h2>


                {/* COMPANY */}

                <div className="jh-job-company">

                  <FaBuilding />

                  <span>
                    {job.companyName ||
                      job.company ||
                      "Company not specified"}
                  </span>

                </div>


                {/* DETAILS */}

                <div className="jh-job-details">

                  <div>
                    <FaMapMarkerAlt />

                    <span>
                      {job.location ||
                        "Location not specified"}
                    </span>
                  </div>


                  <div>
                    <FaMoneyBillWave />

                    <span>
                      {job.salary ||
                        "Salary not specified"}
                    </span>
                  </div>


                  <div>
                    <FaClock />

                    <span>
                      {job.experience ||
                        "Experience not specified"}
                    </span>
                  </div>


                  <div>
                    <FaBriefcase />

                    <span>
                      {job.jobType ||
                        "Full Time"}
                    </span>
                  </div>

                </div>


                {/* CATEGORY */}

                {job.category && (
                  <div className="jh-job-category">
                    {job.category}
                  </div>
                )}


                {/* DESCRIPTION */}

                {job.description && (
                  <p className="jh-job-description">
                    {job.description.length > 125
                      ? `${job.description.substring(
                          0,
                          125
                        )}...`
                      : job.description}
                  </p>
                )}


                {/* DEADLINE */}

                <div className="jh-job-deadline">

                  <FaCalendarAlt />

                  <span>
                    Apply before{" "}
                    <strong>
                      {formatDate(
                        job.lastDate ||
                        job.last_date
                      )}
                    </strong>
                  </span>

                </div>


                {/* ACTIONS */}

                <div className="jh-job-actions">

                  <button
                    className="jh-view-btn"
                    onClick={() =>
                      handleView(jobId)
                    }
                  >
                    <FaEye />
                    View
                  </button>


                  <button
                    className="jh-edit-btn"
                    onClick={() =>
                      handleEdit(jobId)
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>


                  <button
                    className="jh-delete-btn"
                    onClick={() =>
                      handleDelete(jobId)
                    }
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default JobHolderJobs;