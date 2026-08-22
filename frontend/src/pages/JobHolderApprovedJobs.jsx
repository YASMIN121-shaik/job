import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FaCheckCircle,
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaEye,
  FaUsers,
  FaClock,
  FaRedo,
} from "react-icons/fa";

import "./JobHolderApprovedJobs.css";

const API_URL = "http://localhost:5000";

function JobHolderApprovedJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

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
  // FETCH APPROVED JOBS
  // =====================================================

  const fetchApprovedJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token is required. Please login again."
        );
        return;
      }

      console.log("Fetching Job Holder approved jobs...");

      const response = await axios.get(
        `${API_URL}/api/jobholder/approved-jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "APPROVED JOBS RESPONSE:",
        response.data
      );

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (
        Array.isArray(response.data?.jobs)
      ) {
        data = response.data.jobs;
      } else if (
        Array.isArray(response.data?.data)
      ) {
        data = response.data.data;
      }

      setJobs(data);
      setFilteredJobs(data);

    } catch (err) {
      console.error(
        "APPROVED JOBS FETCH ERROR:",
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setError(
          "Authentication token is missing or expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to view approved jobs."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Approved jobs API endpoint was not found."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to load approved jobs."
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
    fetchApprovedJobs();
  }, []);

  // =====================================================
  // FILTER JOBS
  // =====================================================

  useEffect(() => {
    let result = [...jobs];

    const searchValue = search
      .trim()
      .toLowerCase();

    if (searchValue) {
      result = result.filter((job) => {
        const title =
          job.title ||
          job.job_title ||
          job.jobTitle ||
          "";

        const company =
          job.company ||
          job.company_name ||
          job.companyName ||
          "";

        const location =
          job.location || "";

        return (
          String(title)
            .toLowerCase()
            .includes(searchValue) ||
          String(company)
            .toLowerCase()
            .includes(searchValue) ||
          String(location)
            .toLowerCase()
            .includes(searchValue)
        );
      });
    }

    if (typeFilter !== "All") {
      result = result.filter((job) => {
        const type =
          job.job_type ||
          job.jobType ||
          "";

        return (
          String(type).toLowerCase() ===
          typeFilter.toLowerCase()
        );
      });
    }

    setFilteredJobs(result);
  }, [search, typeFilter, jobs]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
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
  // VIEW JOB
  // =====================================================

  const handleViewJob = (job) => {
    const title =
      job.title ||
      job.job_title ||
      job.jobTitle ||
      "Job";

    const company =
      job.company ||
      job.company_name ||
      job.companyName ||
      "Company";

    const location =
      job.location ||
      "Not specified";

    const type =
      job.job_type ||
      job.jobType ||
      "Not specified";

    const salary =
      job.salary ||
      "Not specified";

    const experience =
      job.experience ||
      "Not specified";

    const category =
      job.category ||
      "Not specified";

    const vacancies =
      job.vacancies ??
      "Not specified";

    const workMode =
      job.work_mode ||
      "Not specified";

    const lastDate =
      job.last_date ||
      job.lastDate;

    alert(
      `Job Details\n\n` +
        `Title: ${title}\n\n` +
        `Company: ${company}\n\n` +
        `Location: ${location}\n\n` +
        `Job Type: ${type}\n\n` +
        `Salary: ${salary}\n\n` +
        `Experience: ${experience}\n\n` +
        `Category: ${category}\n\n` +
        `Vacancies: ${vacancies}\n\n` +
        `Work Mode: ${workMode}\n\n` +
        `Last Date: ${formatDate(lastDate)}`
    );
  };

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry = () => {
    fetchApprovedJobs();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="jhaj-page">
        <div className="jhaj-loading">
          <div className="jhaj-spinner"></div>
          <p>Loading approved jobs...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="jhaj-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="jhaj-header">

        <div className="jhaj-heading">

          <div className="jhaj-heading-icon">
            <FaCheckCircle />
          </div>

          <div>
            <h1>Approved Jobs</h1>

            <p>
              View jobs that have been approved by
              the administrator.
            </p>
          </div>

        </div>

        <button
          className="jhaj-refresh-btn"
          onClick={handleRetry}
          disabled={loading}
        >
          <FaRedo />
          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="jhaj-error">

          <div>
            <strong>
              Unable to load approved jobs
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button onClick={handleRetry}>
            <FaRedo />
            Retry
          </button>

        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="jhaj-stats">

        {/* TOTAL */}

        <div className="jhaj-stat-card">

          <div className="jhaj-stat-icon total">
            <FaBriefcase />
          </div>

          <div>
            <span>Approved Jobs</span>

            <strong>
              {jobs.length}
            </strong>
          </div>

        </div>

        {/* ACTIVE */}

        <div className="jhaj-stat-card">

          <div className="jhaj-stat-icon active">
            <FaCheckCircle />
          </div>

          <div>
            <span>Active Jobs</span>

            <strong>
              {
                jobs.filter((job) => {
                  const status =
                    String(
                      job.status || ""
                    ).toLowerCase();

                  return (
                    status === "open" ||
                    status === "active" ||
                    status === "approved"
                  );
                }).length
              }
            </strong>
          </div>

        </div>

        {/* APPLICANTS */}

        <div className="jhaj-stat-card">

          <div className="jhaj-stat-icon applicants">
            <FaUsers />
          </div>

          <div>
            <span>Total Applicants</span>

            <strong>
              {jobs.reduce(
                (total, job) =>
                  total +
                  Number(
                    job.applicant_count ||
                      job.applicants_count ||
                      job.applicants ||
                      0
                  ),
                0
              )}
            </strong>
          </div>

        </div>

        {/* CLOSING SOON */}

        <div className="jhaj-stat-card">

          <div className="jhaj-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Closing Soon</span>

            <strong>
              {
                jobs.filter((job) => {
                  if (!job.last_date) {
                    return false;
                  }

                  const today = new Date();

                  const lastDate =
                    new Date(
                      job.last_date
                    );

                  const difference =
                    Math.ceil(
                      (
                        lastDate -
                        today
                      ) /
                        (1000 *
                          60 *
                          60 *
                          24)
                    );

                  return (
                    difference >= 0 &&
                    difference <= 7
                  );
                }).length
              }
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          FILTER BAR
      ================================================= */}

      <div className="jhaj-filter-bar">

        <div className="jhaj-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search job title, company or location..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="jhaj-type-filter">

          <FaFilter />

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >
            <option value="All">
              All Job Types
            </option>

            <option value="Full Time">
              Full Time
            </option>

            <option value="Part Time">
              Part Time
            </option>

            <option value="Internship">
              Internship
            </option>

            <option value="Contract">
              Contract
            </option>
          </select>

        </div>

      </div>

      {/* =================================================
          RESULTS
      ================================================= */}

      <div className="jhaj-results">

        Showing{" "}

        <strong>
          {filteredJobs.length}
        </strong>{" "}

        approved jobs

      </div>

      {/* =================================================
          EMPTY
      ================================================= */}

      {filteredJobs.length === 0 ? (

        <div className="jhaj-empty">

          <div className="jhaj-empty-icon">
            <FaBriefcase />
          </div>

          <h2>
            No Approved Jobs Found
          </h2>

          <p>
            There are currently no approved jobs
            matching your search or filter.
          </p>

          {error && (
            <button
              className="jhaj-empty-retry"
              onClick={handleRetry}
            >
              <FaRedo />
              Try Again
            </button>
          )}

        </div>

      ) : (

        <div className="jhaj-table-container">

          <table className="jhaj-table">

            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Location</th>
                <th>Job Type</th>
                <th>Salary</th>
                <th>Last Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredJobs.map(
                (job, index) => {

                  const title =
                    job.title ||
                    job.job_title ||
                    job.jobTitle ||
                    "Job";

                  const company =
                    job.company ||
                    job.company_name ||
                    job.companyName ||
                    "Company";

                  const location =
                    job.location ||
                    "Not specified";

                  const type =
                    job.job_type ||
                    job.jobType ||
                    "Not specified";

                  const salary =
                    job.salary ||
                    "Not specified";

                  const lastDate =
                    job.last_date ||
                    job.lastDate;

                  const status =
                    job.status ||
                    "Approved";

                  return (
                    <tr
                      key={
                        job.id ||
                        job.job_id ||
                        index
                      }
                    >

                      {/* JOB */}

                      <td>
                        <div className="jhaj-job">

                          <div className="jhaj-job-icon">
                            <FaBriefcase />
                          </div>

                          <div>
                            <strong>
                              {title}
                            </strong>

                            <span>
                              Job ID:{" "}
                              {job.id ||
                                job.job_id ||
                                "-"}
                            </span>
                          </div>

                        </div>
                      </td>

                      {/* COMPANY */}

                      <td>
                        <span className="jhaj-company">
                          {company}
                        </span>
                      </td>

                      {/* LOCATION */}

                      <td>
                        <div className="jhaj-location">

                          <FaMapMarkerAlt />

                          <span>
                            {location}
                          </span>

                        </div>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span className="jhaj-type">
                          {type}
                        </span>
                      </td>

                      {/* SALARY */}

                      <td>
                        <div className="jhaj-salary">

                          <FaMoneyBillWave />

                          <span>
                            {salary}
                          </span>

                        </div>
                      </td>

                      {/* LAST DATE */}

                      <td>
                        <div className="jhaj-date">

                          <FaCalendarAlt />

                          <span>
                            {formatDate(
                              lastDate
                            )}
                          </span>

                        </div>
                      </td>

                      {/* STATUS */}

                      <td>

                        <span className="jhaj-status">

                          <FaCheckCircle />

                          {status}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <button
                          className="jhaj-view-btn"
                          onClick={() =>
                            handleViewJob(job)
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

export default JobHolderApprovedJobs;