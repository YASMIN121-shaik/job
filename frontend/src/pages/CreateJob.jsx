import React, { useState } from "react";
import "./CreateJob.css";

const API_URL = "http://localhost:5000";

const initialJobState = {
  jobTitle: "",
  companyName: "",
  location: "",
  salary: "",
  experience: "",
  jobType: "",
  category: "",
  department: "",
  education: "",
  vacancies: "",
  skills: "",
  description: "",
  responsibilities: "",
  benefits: "",
  lastDate: "",
  status: "Open",
};

const CreateJob = () => {
  const [job, setJob] = useState(initialJobState);

  const [descriptionFile, setDescriptionFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setJob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // VALIDATE PDF
  // =====================================================

  const validatePDF = (file) => {
    if (!file) {
      return false;
    }

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("PDF file size must be less than 5 MB.");
      return false;
    }

    return true;
  };

  // =====================================================
  // FILE SELECT
  // =====================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validatePDF(file)) {
      e.target.value = "";
      return;
    }

    setDescriptionFile(file);
  };

  // =====================================================
  // DRAG OVER
  // =====================================================

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // =====================================================
  // DROP PDF
  // =====================================================

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (!validatePDF(file)) {
      return;
    }

    setDescriptionFile(file);
  };

  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // =====================================================
  // CREATE JOB
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!job.jobTitle.trim()) {
      alert("Please enter Job Title.");
      return;
    }

    if (!job.companyName.trim()) {
      alert("Please enter Company Name.");
      return;
    }

    if (!job.location.trim()) {
      alert("Please enter Location.");
      return;
    }

    // ---------------------------------------------------
    // GET TOKEN
    // ---------------------------------------------------

    const token = getToken();

    console.log("Create Job Token exists:", !!token);

    if (!token) {
      alert(
        "Authentication token is missing. Please login again."
      );

      localStorage.removeItem("token");

      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // FORM DATA
      // -------------------------------------------------

      const formData = new FormData();

      formData.append(
        "title",
        job.jobTitle.trim()
      );

      formData.append(
        "company",
        job.companyName.trim()
      );

      formData.append(
        "location",
        job.location.trim()
      );

      formData.append(
        "salary",
        job.salary.trim()
      );

      formData.append(
        "experience",
        job.experience.trim()
      );

      formData.append(
        "job_type",
        job.jobType
      );

      formData.append(
        "category",
        job.category
      );

      formData.append(
        "department",
        job.department.trim()
      );

      formData.append(
        "education",
        job.education.trim()
      );

      formData.append(
        "vacancies",
        job.vacancies
      );

      formData.append(
        "skills",
        job.skills.trim()
      );

      formData.append(
        "description",
        job.description.trim()
      );

      formData.append(
        "responsibilities",
        job.responsibilities.trim()
      );

      formData.append(
        "benefits",
        job.benefits.trim()
      );

      formData.append(
        "last_date",
        job.lastDate
      );

      formData.append(
        "status",
        job.status
      );

      // -------------------------------------------------
      // PDF
      // -------------------------------------------------

      if (descriptionFile) {
        formData.append(
          "descriptionFile",
          descriptionFile
        );
      }

      // -------------------------------------------------
      // API REQUEST
      // -------------------------------------------------

      console.log("Sending create job request...");

      const response = await fetch(
        `${API_URL}/api/jobs`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          success: false,
          message: text || "Server returned an invalid response.",
        };
      }

      console.log(
        "Create Job Response:",
        data
      );

      // -------------------------------------------------
      // AUTHENTICATION ERROR
      // -------------------------------------------------

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        alert(
          data.message ||
            "Authentication failed. Please login again."
        );

        return;
      }

      // -------------------------------------------------
      // OTHER ERROR
      // -------------------------------------------------

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to create job"
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      console.log(
        "Job created successfully:",
        data
      );

      alert("Job Created Successfully!");

      handleReset();

    } catch (error) {
      console.error(
        "Create Job Error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while creating the job."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setJob(initialJobState);
    setDescriptionFile(null);

    const fileInput =
      document.getElementById(
        "descriptionFile"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // REMOVE PDF
  // =====================================================

  const removeFile = () => {
    setDescriptionFile(null);

    const fileInput =
      document.getElementById(
        "descriptionFile"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="create-job-container">

      <div className="create-job-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="create-job-header">

          <div>
            <h1>Create New Job</h1>

            <p>
              Create and publish a new job opportunity.
            </p>
          </div>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <h2 className="section-title">
            Basic Information
          </h2>

          <div className="form-grid">

            {/* JOB TITLE */}

            <div className="form-group">

              <label>
                Job Title *
              </label>

              <input
                type="text"
                name="jobTitle"
                value={job.jobTitle}
                onChange={handleChange}
                placeholder="Enter Job Title"
                required
              />

            </div>

            {/* COMPANY */}

            <div className="form-group">

              <label>
                Company Name *
              </label>

              <input
                type="text"
                name="companyName"
                value={job.companyName}
                onChange={handleChange}
                placeholder="Enter Company Name"
                required
              />

            </div>

            {/* LOCATION */}

            <div className="form-group">

              <label>
                Location *
              </label>

              <input
                type="text"
                name="location"
                value={job.location}
                onChange={handleChange}
                placeholder="Enter Location"
                required
              />

            </div>

            {/* SALARY */}

            <div className="form-group">

              <label>
                Salary
              </label>

              <input
                type="text"
                name="salary"
                value={job.salary}
                onChange={handleChange}
                placeholder="e.g. ₹6 - ₹10 LPA"
              />

            </div>

            {/* EXPERIENCE */}

            <div className="form-group">

              <label>
                Experience
              </label>

              <input
                type="text"
                name="experience"
                value={job.experience}
                onChange={handleChange}
                placeholder="e.g. 2 Years"
              />

            </div>

            {/* JOB TYPE */}

            <div className="form-group">

              <label>
                Job Type
              </label>

              <select
                name="jobType"
                value={job.jobType}
                onChange={handleChange}
              >

                <option value="">
                  Select Job Type
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

                <option value="Remote">
                  Remote
                </option>

              </select>

            </div>

            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category
              </label>

              <select
                name="category"
                value={job.category}
                onChange={handleChange}
              >

                <option value="">
                  Select Category
                </option>

                <option value="Software">
                  Software
                </option>

                <option value="Marketing">
                  Marketing
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="Sales">
                  Sales
                </option>

              </select>

            </div>

            {/* DEPARTMENT */}

            <div className="form-group">

              <label>
                Department
              </label>

              <input
                type="text"
                name="department"
                value={job.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
              />

            </div>

            {/* EDUCATION */}

            <div className="form-group">

              <label>
                Education
              </label>

              <input
                type="text"
                name="education"
                value={job.education}
                onChange={handleChange}
                placeholder="e.g. B.Tech / MCA"
              />

            </div>

            {/* VACANCIES */}

            <div className="form-group">

              <label>
                Vacancies
              </label>

              <input
                type="number"
                name="vacancies"
                value={job.vacancies}
                onChange={handleChange}
                placeholder="Number of vacancies"
                min="1"
              />

            </div>

            {/* SKILLS */}

            <div className="form-group">

              <label>
                Skills
              </label>

              <input
                type="text"
                name="skills"
                value={job.skills}
                onChange={handleChange}
                placeholder="React, Node.js, PostgreSQL..."
              />

            </div>

            {/* LAST DATE */}

            <div className="form-group">

              <label>
                Last Date
              </label>

              <input
                type="date"
                name="lastDate"
                value={job.lastDate}
                onChange={handleChange}
              />

            </div>

            {/* STATUS */}

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={job.status}
                onChange={handleChange}
              >

                <option value="Open">
                  Open
                </option>

                <option value="Closed">
                  Closed
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              JOB DESCRIPTION PDF
          ================================================= */}

          <div className="form-group">

            <label>
              Job Description PDF
            </label>

            <div
              className="drop-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >

              <input
                type="file"
                id="descriptionFile"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                style={{
                  display: "none",
                }}
              />

              {!descriptionFile && (
                <label
                  htmlFor="descriptionFile"
                  className="upload-label"
                >

                  <div className="upload-icon">
                    📄
                  </div>

                  <h3>
                    Drag & Drop PDF Here
                  </h3>

                  <p>
                    or click to select a PDF
                  </p>

                  <span>
                    PDF only • Maximum 5 MB
                  </span>

                </label>
              )}

              {descriptionFile && (
                <div className="selected-file">

                  <div>

                    <strong>
                      {descriptionFile.name}
                    </strong>

                    <small>
                      {" "}
                      (
                      {(
                        descriptionFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}
                      {" "}
                      MB)
                    </small>

                  </div>

                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={removeFile}
                  >
                    Remove
                  </button>

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="button-group">

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Job"}
            </button>

            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateJob;