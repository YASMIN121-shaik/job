import React, { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaFilter,
  FaBookmark,
  FaRegBookmark,
  FaBriefcase,
  FaUsers,
  FaClock,
  FaRupeeSign,
  FaBuilding,
  FaChevronDown,
  FaTimes,
  FaFileAlt,
  FaCalendarAlt,
  FaLayerGroup,
} from "react-icons/fa";

import "./FindJobs.css";

const API_URL = "http://localhost:5000";

function FindJobs() {
  // =====================================================
  // STATE
  // =====================================================

  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [sortBy, setSortBy] = useState("Most Relevant");

  const [filters, setFilters] = useState({
    jobType: [],
    experience: [],
    salary: [],
    workMode: [],
  });

  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);

  const [applyingJobId, setApplyingJobId] = useState(null);
  const [savingJobId, setSavingJobId] = useState(null);

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
      console.error("Error reading logged-in user:", error);
      return null;
    }
  };

  // =====================================================
  // GET USER EMAIL
  // =====================================================

  const getUserEmail = () => {
    const user = getLoggedInUser();

    return user?.email || "";
  };

  // =====================================================
  // NORMALIZE JOB
  // =====================================================

  const normalizeJob = (job) => {
    return {
      ...job,

      id: job.id || job.job_id || job.jobId,

      title:
        job.title ||
        job.job_title ||
        job.jobTitle ||
        "Untitled Job",

      company:
        job.company ||
        job.company_name ||
        job.companyName ||
        "Company",

      location:
        job.location ||
        job.job_location ||
        job.city ||
        "Not specified",

      salary:
        job.salary ||
        job.salary_range ||
        job.salaryRange ||
        "Not specified",

      job_type:
        job.job_type ||
        job.jobType ||
        job.type ||
        "Full Time",

      experience:
        job.experience ||
        job.experience_required ||
        job.experienceRequired ||
        "Not specified",

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

      description_file:
        job.description_file ||
        job.descriptionFile ||
        job.description_file_path ||
        job.descriptionFilePath ||
        job.file_path ||
        job.filePath ||
        job.description_url ||
        job.descriptionUrl ||
        "",
    };
  };

  // =====================================================
  // DESCRIPTION FILE URL
  // =====================================================

  const getDescriptionFileUrl = (filePath) => {
    if (!filePath) {
      return "";
    }

    const value = String(filePath).trim();

    if (!value) {
      return "";
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return `${API_URL}${
      value.startsWith("/") ? value : `/${value}`
    }`;
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchSavedJobs();

    const interval = setInterval(() => {
      fetchJobs(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // FETCH JOBS
  // =====================================================

  const fetchJobs = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_URL}/api/jobs`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      console.log("Jobs from backend:", data);

      const jobsData = Array.isArray(data)
        ? data
        : Array.isArray(data.jobs)
        ? data.jobs
        : Array.isArray(data.data)
        ? data.data
        : [];

      const normalizedJobs = jobsData
        .map(normalizeJob)
        .filter(
          (job) =>
            job.id !== undefined &&
            job.id !== null
        );

      console.log("Normalized jobs:", normalizedJobs);

      setJobs(normalizedJobs);
    } catch (error) {
      console.error("Fetch jobs error:", error);

      if (!silent) {
        setError(
          "Unable to load jobs from server. Please check your backend."
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      const email = getUserEmail();

      if (!email) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/jobseeker/applications?email=${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();

      console.log("Applications:", data);

      const applications = Array.isArray(data)
        ? data
        : data.applications ||
          data.data ||
          [];

      const jobIds = applications
        .map((application) =>
          Number(
            application.job_id ||
              application.jobId ||
              application.jobID ||
              application.id
          )
        )
        .filter((id) => !isNaN(id));

      setAppliedJobs(jobIds);
    } catch (error) {
      console.error(
        "Applications fetch error:",
        error
      );
    }
  };

  // =====================================================
  // FETCH SAVED JOBS
  // =====================================================

  const fetchSavedJobs = async () => {
    try {
      const email = getUserEmail();

      if (!email) {
        console.log(
          "No logged-in user. Saved jobs not loaded."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/jobseeker/saved-jobs?email=${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch saved jobs: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Saved jobs from backend:",
        data
      );

      const saved = Array.isArray(data)
        ? data
        : data.savedJobs ||
          data.saved_jobs ||
          data.data ||
          [];

      const jobIds = saved
        .map((item) =>
          Number(
            item.job_id ||
              item.jobId ||
              item.jobID ||
              item.id
          )
        )
        .filter((id) => !isNaN(id));

      setSavedJobs(jobIds);
    } catch (error) {
      console.error(
        "Saved jobs fetch error:",
        error
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    setSearch(search.trim());
    setLocation(location.trim());
  };

  // =====================================================
  // TOGGLE FILTER
  // =====================================================

  const toggleFilter = (category, value) => {
    setFilters((previous) => {
      const current = previous[category];

      return {
        ...previous,

        [category]: current.includes(value)
          ? current.filter(
              (item) => item !== value
            )
          : [...current, value],
      };
    });
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setFilters({
      jobType: [],
      experience: [],
      salary: [],
      workMode: [],
    });

    setSearch("");
    setLocation("");
  };

  // =====================================================
  // SAVE / REMOVE JOB
  // =====================================================

  const toggleSaveJob = async (jobId) => {
    const user = getLoggedInUser();

    if (!user?.email) {
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

    const alreadySaved =
      savedJobs.includes(numericJobId);

    try {
      setSavingJobId(numericJobId);

      // REMOVE SAVED JOB
      if (alreadySaved) {
        const response = await fetch(
          `${API_URL}/api/jobseeker/saved-jobs`,
          {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email: user.email,
              job_id: numericJobId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to remove saved job"
          );
        }

        setSavedJobs((previous) =>
          previous.filter(
            (id) => id !== numericJobId
          )
        );

        return;
      }

      // SAVE JOB
      const response = await fetch(
        `${API_URL}/api/jobseeker/saved-jobs`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: user.email,
            job_id: numericJobId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to save job"
        );
      }

      setSavedJobs((previous) => {
        if (previous.includes(numericJobId)) {
          return previous;
        }

        return [
          ...previous,
          numericJobId,
        ];
      });
    } catch (error) {
      console.error(
        "Save job error:",
        error
      );

      alert(
        error.message ||
          "Unable to save job. Please check your backend."
      );
    } finally {
      setSavingJobId(null);
    }
  };

  // =====================================================
  // APPLY JOB
  // =====================================================

  const handleApply = async (job) => {
    if (!job || !job.id) {
      alert("Invalid job.");
      return;
    }

    const jobId = Number(job.id);

    if (appliedJobs.includes(jobId)) {
      alert(
        "You have already applied for this job."
      );
      return;
    }

    try {
      setApplyingJobId(jobId);

      const user = getLoggedInUser();

      if (!user) {
        alert(
          "Your login session has expired. Please login again."
        );
        return;
      }

      const applicantId =
        user.id ||
        user.user_id ||
        user.userId;

      const applicantName =
        user.fullname ||
        user.name ||
        "";

      const applicantEmail =
        user.email ||
        "";

      if (!applicantId) {
        alert(
          "Applicant ID not found in your login session. Please logout and login again."
        );
        return;
      }

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

            phone: user.phone || "",

            experience:
              user.experience ||
              "Fresher",

            resume:
              user.resume || "",

            status: "Applied",
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Apply response:",
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            data.error ||
            "Failed to apply for this job."
        );

        return;
      }

      setAppliedJobs((previous) => {
        if (previous.includes(jobId)) {
          return previous;
        }

        return [...previous, jobId];
      });

      alert(
        data.message ||
          `Application submitted successfully for ${job.title}!`
      );

      await fetchApplications();
    } catch (error) {
      console.error(
        "Apply error:",
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
  // OPEN DETAILS
  // =====================================================

  const handleDetails = (job) => {
    setSelectedJob(job);
  };

  // =====================================================
  // DYNAMIC FILTER DATA
  // =====================================================

  const filterData = useMemo(() => {
    // ---------------------------------------------------
    // JOB TYPE
    // ---------------------------------------------------

    const jobTypeMap = {};

    jobs.forEach((job) => {
      const value =
        String(job.job_type || "").trim() ||
        "Not specified";

      jobTypeMap[value] =
        (jobTypeMap[value] || 0) + 1;
    });

    const jobTypeOptions =
      Object.entries(jobTypeMap)
        .map(([value, count]) => ({
          label: value,
          value,
          count,
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label)
        );

    // ---------------------------------------------------
    // EXPERIENCE
    // ---------------------------------------------------

    const experienceMap = {};

    jobs.forEach((job) => {
      const value =
        String(job.experience || "").trim() ||
        "Not specified";

      experienceMap[value] =
        (experienceMap[value] || 0) + 1;
    });

    const experienceOptions =
      Object.entries(experienceMap)
        .map(([value, count]) => ({
          label: value,
          value,
          count,
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label)
        );

    // ---------------------------------------------------
    // FIXED SALARY RANGE
    // ---------------------------------------------------

    const salaryOptions = [
      {
        label: "Below ₹3 LPA",
        value: "below-3",
        min: 0,
        max: 3,
      },
      {
        label: "₹3 - ₹5 LPA",
        value: "3-5",
        min: 3,
        max: 5,
      },
      {
        label: "₹5 - ₹8 LPA",
        value: "5-8",
        min: 5,
        max: 8,
      },
      {
        label: "₹8 - ₹12 LPA",
        value: "8-12",
        min: 8,
        max: 12,
      },
      {
        label: "₹12 - ₹20 LPA",
        value: "12-20",
        min: 12,
        max: 20,
      },
      {
        label: "₹20 LPA+",
        value: "20-plus",
        min: 20,
        max: Infinity,
      },
    ];

    // ---------------------------------------------------
    // WORK MODE
    // ---------------------------------------------------

    const workModeMap = {};

    jobs.forEach((job) => {
      const value =
        String(job.work_mode || "").trim() ||
        "Not specified";

      workModeMap[value] =
        (workModeMap[value] || 0) + 1;
    });

    const workModeOptions =
      Object.entries(workModeMap)
        .map(([value, count]) => ({
          label: value,
          value,
          count,
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label)
        );

    return {
      jobTypeOptions,
      experienceOptions,
      salaryOptions,
      workModeOptions,
    };
  }, [jobs]);

  // =====================================================
  // NORMALIZE TEXT
  // =====================================================

  const normalizeText = (value) => {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  };

  // =====================================================
  // MATCH NORMAL FILTER
  // =====================================================

  const matchesSelectedValue = (
    actualValue,
    selectedValues
  ) => {
    if (!selectedValues.length) {
      return true;
    }

    const actual = normalizeText(actualValue);

    return selectedValues.some((selected) => {
      const expected =
        normalizeText(selected);

      return (
        actual === expected ||
        actual.includes(expected) ||
        expected.includes(actual)
      );
    });
  };

  // =====================================================
  // CONVERT SALARY TO LPA
  // =====================================================

  const getSalaryInLPA = (salary) => {
    if (!salary) {
      return null;
    }

    const value = String(salary)
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/₹/g, "")
      .trim();

    if (
      value === "" ||
      value === "not specified"
    ) {
      return null;
    }

    // -----------------------------------------------
    // LPA FORMAT
    // Examples:
    // 5 LPA
    // 5-8 LPA
    // 8 lakh
    // 8 lakhs
    // -----------------------------------------------

    const lpaMatch = value.match(
      /(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:lpa|lakh|lakhs)/
    );

    if (lpaMatch) {
      const first = parseFloat(lpaMatch[1]);

      const second = lpaMatch[2]
        ? parseFloat(lpaMatch[2])
        : first;

      return {
        min: Math.min(first, second),
        max: Math.max(first, second),
      };
    }

    // -----------------------------------------------
    // MONTHLY FORMAT
    // Examples:
    // ₹25000/month
    // 25000 per month
    // 25k/month
    // -----------------------------------------------

    const monthlyMatch = value.match(
      /(\d+(?:\.\d+)?)\s*k?\s*(?:\/\s*month|per\s*month|monthly)/
    );

    if (monthlyMatch) {
      let monthly = parseFloat(
        monthlyMatch[1]
      );

      if (value.includes("k")) {
        monthly *= 1000;
      }

      const lpa =
        (monthly * 12) / 100000;

      return {
        min: lpa,
        max: lpa,
      };
    }

    // -----------------------------------------------
    // 25k FORMAT
    // -----------------------------------------------

    const kMatch = value.match(
      /(\d+(?:\.\d+)?)\s*k/
    );

    if (kMatch) {
      const monthly =
        parseFloat(kMatch[1]) * 1000;

      const lpa =
        (monthly * 12) / 100000;

      return {
        min: lpa,
        max: lpa,
      };
    }

    // -----------------------------------------------
    // PURE NUMBER
    // -----------------------------------------------

    const numbers = value.match(
      /\d+(?:\.\d+)?/g
    );

    if (numbers && numbers.length > 0) {
      const number = parseFloat(numbers[0]);

      // If number is small, assume LPA
      if (number <= 100) {
        return {
          min: number,
          max: number,
        };
      }

      // Otherwise assume annual salary in rupees
      if (number >= 100000) {
        const lpa = number / 100000;

        return {
          min: lpa,
          max: lpa,
        };
      }
    }

    return null;
  };

  // =====================================================
  // SALARY RANGE MATCHING
  // =====================================================

  const matchesSalaryRange = (
    salary,
    selectedRanges
  ) => {
    if (!selectedRanges.length) {
      return true;
    }

    const salaryRange =
      getSalaryInLPA(salary);

    if (!salaryRange) {
      return false;
    }

    return selectedRanges.some(
      (selectedValue) => {
        const option =
          filterData.salaryOptions.find(
            (item) =>
              item.value === selectedValue
          );

        if (!option) {
          return false;
        }

        // Salary overlaps selected range
        return (
          salaryRange.max >= option.min &&
          salaryRange.min <= option.max
        );
      }
    );
  };

  // =====================================================
  // FILTERED JOBS
  // =====================================================

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    const searchText =
      normalizeText(search);

    const locationText =
      normalizeText(location);

    // =================================================
    // SEARCH
    // =================================================

    if (searchText) {
      result = result.filter((job) => {
        const title =
          normalizeText(job.title);

        const company =
          normalizeText(job.company);

        const skills =
          normalizeText(job.skills);

        const description =
          normalizeText(job.description);

        const category =
          normalizeText(job.category);

        const department =
          normalizeText(job.department);

        return (
          title.includes(searchText) ||
          company.includes(searchText) ||
          skills.includes(searchText) ||
          description.includes(searchText) ||
          category.includes(searchText) ||
          department.includes(searchText)
        );
      });
    }

    // =================================================
    // LOCATION
    // =================================================

    if (locationText) {
      result = result.filter((job) =>
        normalizeText(job.location).includes(
          locationText
        )
      );
    }

    // =================================================
    // JOB TYPE
    // =================================================

    if (filters.jobType.length > 0) {
      result = result.filter((job) =>
        matchesSelectedValue(
          job.job_type,
          filters.jobType
        )
      );
    }

    // =================================================
    // EXPERIENCE
    // =================================================

    if (filters.experience.length > 0) {
      result = result.filter((job) =>
        matchesSelectedValue(
          job.experience,
          filters.experience
        )
      );
    }

    // =================================================
    // SALARY RANGE
    // =================================================

    if (filters.salary.length > 0) {
      result = result.filter((job) =>
        matchesSalaryRange(
          job.salary,
          filters.salary
        )
      );
    }

    // =================================================
    // WORK MODE
    // =================================================

    if (filters.workMode.length > 0) {
      result = result.filter((job) =>
        matchesSelectedValue(
          job.work_mode,
          filters.workMode
        )
      );
    }

    // =================================================
    // SORT
    // =================================================

    if (sortBy === "Newest") {
      result.sort((a, b) => {
        const dateA = a.created_at
          ? new Date(
              a.created_at
            ).getTime()
          : 0;

        const dateB = b.created_at
          ? new Date(
              b.created_at
            ).getTime()
          : 0;

        return dateB - dateA;
      });
    }

    return result;
  }, [
    jobs,
    search,
    location,
    filters,
    sortBy,
    filterData.salaryOptions,
  ]);

  // =====================================================
  // REUSABLE FILTER SECTION
  // =====================================================

  const filterSection = (
    title,
    category,
    options
  ) => {
    if (!options || options.length === 0) {
      return null;
    }

    return (
      <div className="filter-section">
        <div className="filter-section-header">
          <h4>{title}</h4>

          {filters[category]?.length > 0 && (
            <button
              type="button"
              className="filter-section-clear"
              onClick={() =>
                setFilters((previous) => ({
                  ...previous,
                  [category]: [],
                }))
              }
            >
              Clear
            </button>
          )}
        </div>

        <div className="filter-options-list">
          {options.map((item) => {
            const checked =
              filters[category]?.includes(
                item.value
              );

            return (
              <label
                className={`filter-option ${
                  checked ? "active" : ""
                }`}
                key={`${category}-${item.value}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggleFilter(
                      category,
                      item.value
                    )
                  }
                />

                <span className="custom-checkbox">
                  {checked && "✓"}
                </span>

                <span className="filter-label">
                  {item.label}
                </span>

                {/* SALARY DOES NOT NEED JOB COUNT */}
                {category !== "salary" && (
                  <span className="filter-count">
                    {item.count}
                  </span>
                )}

                {/* SALARY RANGE ICON */}
                {category === "salary" && (
                  <span className="filter-count">
                    ₹
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="find-jobs-page">
        <div className="jobs-loading">
          <div className="loading-spinner"></div>

          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="find-jobs-page">

      {/* =================================================
          SEARCH
      ================================================= */}

      <section className="find-jobs-search-card">

        <div className="search-field large-search">
          <FaSearch />

          <input
            type="text"
            placeholder="Job title, skills or company"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          {search && (
            <button
              type="button"
              className="clear-input"
              onClick={() =>
                setSearch("")
              }
              title="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="search-field location-search">
          <FaMapMarkerAlt />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          {location && (
            <button
              type="button"
              className="clear-input"
              onClick={() =>
                setLocation("")
              }
              title="Clear location"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <button
          type="button"
          className="search-jobs-btn"
          onClick={handleSearch}
        >
          <FaSearch />
          <span>Search Jobs</span>
        </button>

      </section>

      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="find-jobs-layout">

        {/* =================================================
            FILTER SIDEBAR
        ================================================= */}

        <aside className="jobs-filter-sidebar">

          <div className="filter-heading">

            <div className="filter-heading-title">
              <FaFilter />

              <h3>Filters</h3>
            </div>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear All
            </button>

          </div>

          {filterSection(
            "Job Type",
            "jobType",
            filterData.jobTypeOptions
          )}

          {filterSection(
            "Experience",
            "experience",
            filterData.experienceOptions
          )}

          {/* FIXED SALARY FILTER */}
          {filterSection(
            "Salary Range",
            "salary",
            filterData.salaryOptions
          )}

          {filterSection(
            "Work Mode",
            "workMode",
            filterData.workModeOptions
          )}

        </aside>

        {/* =================================================
            RESULTS
        ================================================= */}

        <section className="jobs-results">

          <div className="jobs-results-header">

            <div>
              <h2>
                Recommended Jobs
              </h2>

              <p>
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1
                  ? "job"
                  : "jobs"}{" "}
                matching your profile
              </p>
            </div>

            <div className="sort-box">

              <span>Sort by</span>

              <div className="sort-select">

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Most Relevant
                  </option>

                  <option>
                    Newest
                  </option>
                </select>

                <FaChevronDown />

              </div>

            </div>

          </div>

          {/* =================================================
              JOB LIST
          ================================================= */}

          <div className="jobs-list">

            {error ? (

              <div className="no-jobs">

                <FaTimes />

                <h3>
                  Unable to load jobs
                </h3>

                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    fetchJobs()
                  }
                >
                  Try Again
                </button>

              </div>

            ) : filteredJobs.length === 0 ? (

              <div className="no-jobs">

                <FaSearch />

                <h3>
                  No jobs found
                </h3>

                <p>
                  Try changing your search
                  or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              filteredJobs.map((job) => {

                const jobId =
                  Number(job.id);

                const isApplied =
                  appliedJobs.includes(
                    jobId
                  );

                const isSaved =
                  savedJobs.includes(
                    jobId
                  );

                const isApplying =
                  applyingJobId ===
                  jobId;

                const isSaving =
                  savingJobId ===
                  jobId;

                const skills = String(
                  job.skills || ""
                )
                  .split(",")
                  .map((skill) =>
                    skill.trim()
                  )
                  .filter(Boolean);

                return (
                  <article
                    className="job-card"
                    key={job.id}
                  >

                    {/* COMPANY ICON */}

                    <div className="company-icon">
                      <FaBuilding />
                    </div>

                    {/* JOB INFO */}

                    <div className="job-main-info">

                      <div className="job-title-row">

                        <h3>
                          {job.title}
                        </h3>

                        <span className="posted-time">
                          <FaClock />

                          {job.created_at
                            ? new Date(
                                job.created_at
                              ).toLocaleDateString()
                            : "Recently posted"}
                        </span>

                      </div>

                      <p className="company-name">
                        {job.company}
                      </p>

                      <div className="job-meta">

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

                      </div>

                      <div className="job-tags">

                        <span>
                          <FaUsers />
                          {job.experience}
                        </span>

                        <span>
                          {job.work_mode}
                        </span>

                        {skills
                          .slice(0, 3)
                          .map(
                            (skill) => (
                              <span
                                key={skill}
                              >
                                {skill}
                              </span>
                            )
                          )}

                        {job.description_file && (
                          <span
                            className="description-file-tag"
                            title="Job description file available"
                          >
                            <FaFileAlt />
                            PDF
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="job-actions">

                      <button
                        type="button"
                        className={`save-job-btn ${
                          isSaved
                            ? "saved"
                            : ""
                        }`}
                        onClick={() =>
                          toggleSaveJob(
                            jobId
                          )
                        }
                        disabled={
                          isSaving
                        }
                        title={
                          isSaved
                            ? "Remove saved job"
                            : "Save job"
                        }
                      >
                        {isSaving ? (
                          <span className="save-loading">
                            ...
                          </span>
                        ) : isSaved ? (
                          <FaBookmark />
                        ) : (
                          <FaRegBookmark />
                        )}
                      </button>

                      <button
                        type="button"
                        className="details-btn"
                        onClick={() =>
                          handleDetails(
                            job
                          )
                        }
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className={`apply-btn ${
                          isApplied
                            ? "applied"
                            : ""
                        }`}
                        onClick={() =>
                          handleApply(job)
                        }
                        disabled={
                          isApplied ||
                          isApplying
                        }
                      >
                        {isApplying
                          ? "Applying..."
                          : isApplied
                          ? "Applied ✓"
                          : "Apply Now"}
                      </button>

                    </div>

                  </article>
                );
              })
            )}

          </div>

        </section>

      </div>

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

            <div className="modal-company-icon">
              <FaBuilding />
            </div>

            <h2>
              {selectedJob.title}
            </h2>

            <p className="modal-company">
              {selectedJob.company}
            </p>

            {/* BASIC INFORMATION */}

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

            {/* JOB DESCRIPTION */}

            <div className="modal-section modal-description-section">

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
                    No text job description
                    provided by the employer.
                  </p>

                )}

              </div>

              {selectedJob.description_file && (

                <div className="uploaded-description-file">

                  <div className="uploaded-description-file-info">

                    <FaFileAlt />

                    <div>

                      <strong>
                        Job Description File
                      </strong>

                      <span>
                        PDF/document uploaded
                        by the employer
                      </span>

                    </div>

                  </div>

                  <a
                    href={getDescriptionFileUrl(
                      selectedJob.description_file
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-description-file-btn"
                  >
                    <FaFileAlt />
                    View Description File
                  </a>

                </div>

              )}

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
                  .map((skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  ))}

              </div>

            </div>

            {/* SAVE JOB */}

            <button
              type="button"
              className={`modal-save-btn ${
                savedJobs.includes(
                  Number(
                    selectedJob.id
                  )
                )
                  ? "saved"
                  : ""
              }`}
              onClick={() =>
                toggleSaveJob(
                  Number(
                    selectedJob.id
                  )
                )
              }
              disabled={
                savingJobId ===
                Number(
                  selectedJob.id
                )
              }
            >

              {savingJobId ===
              Number(
                selectedJob.id
              ) ? (
                "Saving..."
              ) : savedJobs.includes(
                  Number(
                    selectedJob.id
                  )
                ) ? (
                <>
                  <FaBookmark />
                  Saved Job
                </>
              ) : (
                <>
                  <FaRegBookmark />
                  Save Job
                </>
              )}

            </button>

            {/* APPLY */}

            <button
              type="button"
              className="modal-apply-btn"
              disabled={
                appliedJobs.includes(
                  Number(
                    selectedJob.id
                  )
                ) ||
                applyingJobId ===
                  Number(
                    selectedJob.id
                  )
              }
              onClick={async () => {

                await handleApply(
                  selectedJob
                );

                setSelectedJob(null);

              }}
            >

              {applyingJobId ===
              Number(
                selectedJob.id
              )
                ? "Applying..."
                : appliedJobs.includes(
                    Number(
                      selectedJob.id
                    )
                  )
                ? "Already Applied ✓"
                : "Apply Now"}

            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default FindJobs;