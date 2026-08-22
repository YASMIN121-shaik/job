import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageJobs.css";

import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";


// =====================================================
// API CONFIG
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// GET AUTH TOKEN
// =====================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("accessToken")
  );
};


// =====================================================
// AXIOS AUTH CONFIG
// =====================================================

const getAuthConfig = () => {
  const token = getToken();

  if (!token) {
    console.error(
      "Authentication token not found in localStorage/sessionStorage"
    );

    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};


// =====================================================
// MANAGE JOBS
// =====================================================

function ManageJobs() {

  // ===================================================
  // STATE
  // ===================================================

  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);


  // ===================================================
  // FETCH JOBS
  // ===================================================

  const fetchJobs = async () => {

    try {

      setLoading(true);

      const token = getToken();

      console.log(
        "Authentication token:",
        token ? "Token found" : "Token missing"
      );

      const res = await axios.get(
        `${API_URL}/api/jobs`,
        getAuthConfig()
      );

      console.log(
        "Jobs API Response:",
        res.data
      );


      // -----------------------------------------------
      // RESPONSE HANDLING
      // -----------------------------------------------

      if (Array.isArray(res.data)) {

        setJobs(res.data);

      } else if (
        res.data &&
        Array.isArray(res.data.jobs)
      ) {

        setJobs(res.data.jobs);

      } else {

        console.error(
          "Invalid jobs response:",
          res.data
        );

        setJobs([]);
      }

    } catch (err) {

      console.error(
        "Fetch Jobs Error:",
        err
      );


      if (err.response?.status === 401) {

        alert(
          "Authentication token is missing or expired. Please login again."
        );

      } else if (err.response?.status === 403) {

        alert(
          "You are not authorized to manage jobs."
        );
      }


      setJobs([]);

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    fetchJobs();

  }, []);


  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = async () => {

    try {

      setRefreshing(true);

      await fetchJobs();

    } finally {

      setRefreshing(false);

    }
  };


  // ===================================================
  // ADD JOB
  // ===================================================

  const addJob = async () => {

    // -----------------------------------------------
    // TOKEN CHECK
    // -----------------------------------------------

    const token = getToken();

    if (!token) {

      alert(
        "Authentication token is missing. Please login again."
      );

      return;
    }


    // -----------------------------------------------
    // JOB TITLE
    // -----------------------------------------------

    const title = window.prompt(
      "Enter Job Title"
    );

    if (!title || !title.trim()) {

      alert(
        "Job title is required."
      );

      return;
    }


    // -----------------------------------------------
    // COMPANY
    // -----------------------------------------------

    const company = window.prompt(
      "Enter Company Name"
    );

    if (!company || !company.trim()) {

      alert(
        "Company name is required."
      );

      return;
    }


    // -----------------------------------------------
    // LOCATION
    // -----------------------------------------------

    const location = window.prompt(
      "Enter Location"
    );

    if (!location || !location.trim()) {

      alert(
        "Location is required."
      );

      return;
    }


    // -----------------------------------------------
    // SALARY
    // -----------------------------------------------

    const salary = window.prompt(
      "Enter Salary"
    );

    if (!salary || !salary.trim()) {

      alert(
        "Salary is required."
      );

      return;
    }


    // -----------------------------------------------
    // API REQUEST
    // -----------------------------------------------

    try {

      const response = await axios.post(
        `${API_URL}/api/jobs`,
        {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          salary: salary.trim(),
        },
        getAuthConfig()
      );


      console.log(
        "ADD JOB RESPONSE:",
        response.data
      );


      if (
        response.data &&
        response.data.success !== false
      ) {

        alert(
          "Job Added Successfully"
        );

        await fetchJobs();

      } else {

        alert(
          response.data?.message ||
          "Failed to add job"
        );
      }

    } catch (err) {

      console.error(
        "Add Job Error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        alert(
          "Authentication token is missing or expired. Please login again."
        );

      } else if (
        err.response?.status === 403
      ) {

        alert(
          "You are not authorized to add jobs."
        );

      } else {

        alert(
          err.response?.data?.message ||
          "Failed to add job"
        );
      }
    }
  };


  // ===================================================
  // EDIT JOB
  // ===================================================

  const editJob = async (id) => {

    // -----------------------------------------------
    // TOKEN CHECK
    // -----------------------------------------------

    const token = getToken();

    if (!token) {

      alert(
        "Authentication token is missing. Please login again."
      );

      return;
    }


    // -----------------------------------------------
    // FIND JOB
    // -----------------------------------------------

    const job = jobs.find(
      (item) => item.id === id
    );


    if (!job) {

      alert(
        "Job not found"
      );

      return;
    }


    // -----------------------------------------------
    // JOB TITLE
    // -----------------------------------------------

    const title = window.prompt(
      "Job Title",
      job.title || ""
    );


    if (!title || !title.trim()) {

      return;
    }


    // -----------------------------------------------
    // COMPANY
    // -----------------------------------------------

    const company = window.prompt(
      "Company",
      job.company || ""
    );


    if (!company || !company.trim()) {

      return;
    }


    // -----------------------------------------------
    // LOCATION
    // -----------------------------------------------

    const location = window.prompt(
      "Location",
      job.location || ""
    );


    if (!location || !location.trim()) {

      return;
    }


    // -----------------------------------------------
    // SALARY
    // -----------------------------------------------

    const salary = window.prompt(
      "Salary",
      job.salary || ""
    );


    if (!salary || !salary.trim()) {

      return;
    }


    // -----------------------------------------------
    // API REQUEST
    // -----------------------------------------------

    try {

      const response = await axios.put(
        `${API_URL}/api/jobs/${id}`,
        {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          salary: salary.trim(),
        },
        getAuthConfig()
      );


      console.log(
        "EDIT JOB RESPONSE:",
        response.data
      );


      if (
        response.data &&
        response.data.success !== false
      ) {

        alert(
          "Job Updated Successfully"
        );

        await fetchJobs();

      } else {

        alert(
          response.data?.message ||
          "Failed to update job"
        );
      }

    } catch (err) {

      console.error(
        "Edit Job Error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        alert(
          "Authentication token is missing or expired. Please login again."
        );

      } else if (
        err.response?.status === 403
      ) {

        alert(
          "You are not authorized to edit jobs."
        );

      } else {

        alert(
          err.response?.data?.message ||
          "Failed to update job"
        );
      }
    }
  };


  // ===================================================
  // DELETE JOB
  // ===================================================

  const deleteJob = async (id) => {

    // -----------------------------------------------
    // TOKEN CHECK
    // -----------------------------------------------

    const token = getToken();

    if (!token) {

      alert(
        "Authentication token is missing. Please login again."
      );

      return;
    }


    // -----------------------------------------------
    // CONFIRMATION
    // -----------------------------------------------

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this job?"
      );


    if (!confirmDelete) {

      return;
    }


    // -----------------------------------------------
    // DELETE REQUEST
    // -----------------------------------------------

    try {

      const response = await axios.delete(
        `${API_URL}/api/jobs/${id}`,
        getAuthConfig()
      );


      console.log(
        "DELETE JOB RESPONSE:",
        response.data
      );


      if (
        response.data &&
        response.data.success !== false
      ) {

        alert(
          "Job Deleted Successfully"
        );

        await fetchJobs();

      } else {

        alert(
          response.data?.message ||
          "Failed to delete job"
        );
      }

    } catch (err) {

      console.error(
        "Delete Job Error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        alert(
          "Authentication token is missing or expired. Please login again."
        );

      } else if (
        err.response?.status === 403
      ) {

        alert(
          "You are not authorized to delete jobs."
        );

      } else {

        alert(
          err.response?.data?.message ||
          "Failed to delete job"
        );
      }
    }
  };


  // ===================================================
  // SEARCH
  // ===================================================

  const filteredJobs = (
    Array.isArray(jobs)
      ? jobs
      : []
  ).filter((job) => {

    const searchText =
      search
        .toLowerCase()
        .trim();


    if (!searchText) {

      return true;
    }


    return (

      (job.title || "")
        .toLowerCase()
        .includes(searchText)

      ||

      (job.company || "")
        .toLowerCase()
        .includes(searchText)

      ||

      (job.location || "")
        .toLowerCase()
        .includes(searchText)

      ||

      String(job.salary || "")
        .toLowerCase()
        .includes(searchText)

    );
  });


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="manage-jobs-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="manage-jobs-header">

        <div>

          <h1>
            Manage Jobs
          </h1>

          <p>
            View, add, edit and delete
            job postings.
          </p>

        </div>


        <div className="manage-jobs-header-actions">

          {/* REFRESH */}

          <button
            type="button"
            className="refresh-job-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >

            <FaSyncAlt
              className={
                refreshing
                  ? "refresh-spinning"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>


          {/* ADD */}

          <button
            type="button"
            className="add-job-btn"
            onClick={addJob}
          >

            <FaPlus />

            Add Job

          </button>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="search-box">

        <FaSearch />

        <input
          type="text"
          placeholder="Search by Job Title, Company or Location..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>


      {/* =================================================
          COUNT
      ================================================= */}

      <div className="jobs-count">

        Showing{" "}

        <strong>
          {filteredJobs.length}
        </strong>

        {" "}of{" "}

        <strong>
          {jobs.length}
        </strong>

        {" "}jobs

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-container">

        <table className="jobs-table">

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Job Title
              </th>

              <th>
                Company
              </th>

              <th>
                Location
              </th>

              <th>
                Salary
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {/* LOADING */}

            {loading ? (

              <tr>

                <td
                  colSpan="6"
                  className="table-message"
                >

                  Loading jobs...

                </td>

              </tr>

            ) : filteredJobs.length > 0 ? (

              filteredJobs.map(
                (job) => (

                  <tr
                    key={job.id}
                  >

                    <td>
                      {job.id}
                    </td>


                    <td className="job-title-cell">

                      {job.title ||
                        "Untitled Job"}

                    </td>


                    <td>

                      {job.company ||
                        "Not specified"}

                    </td>


                    <td>

                      {job.location ||
                        "Not specified"}

                    </td>


                    <td className="salary-cell">

                      ₹
                      {job.salary ||
                        "Not specified"}

                    </td>


                    <td>

                      <div className="action-buttons">

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit Job"
                          onClick={() =>
                            editJob(
                              job.id
                            )
                          }
                        >

                          <FaEdit />

                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete Job"
                          onClick={() =>
                            deleteJob(
                              job.id
                            )
                          }
                        >

                          <FaTrash />

                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="table-message"
                >

                  {search
                    ? "No jobs match your search."
                    : "No jobs found."}

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}


export default ManageJobs;