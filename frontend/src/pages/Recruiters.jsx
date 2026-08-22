import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Recruiters.css";

import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserTie,
  FaTimes,
  FaSyncAlt,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

function Recruiters() {
  // =====================================================
  // STATE
  // =====================================================

  const [recruiters, setRecruiters] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // =====================================================
  // GET TOKEN
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
  // FETCH RECRUITERS
  // =====================================================

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        console.error("AUTH TOKEN NOT FOUND");

        alert(
          "Authentication token not found. Please login again."
        );

        setRecruiters([]);
        return;
      }

      console.log("========================================");
      console.log("FETCHING MANAGER RECRUITERS");
      console.log("Token exists:", !!token);

      const response = await axios.get(
        `${API_URL}/api/manager/recruiters`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "RECRUITERS RESPONSE:",
        response.data
      );

      if (
        response.data &&
        Array.isArray(response.data.recruiters)
      ) {
        setRecruiters(response.data.recruiters);
      } else {
        setRecruiters([]);
      }
    } catch (error) {
      console.error(
        "GET RECRUITERS ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        alert(
          "Authentication failed. Please login again."
        );
      } else if (error.response?.status === 403) {
        alert(
          "Access denied. Only managers can manage recruiters."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to load recruiters."
        );
      }

      setRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredRecruiters = Array.isArray(recruiters)
    ? recruiters.filter((recruiter) => {
        const searchText = search
          .toLowerCase()
          .trim();

        if (!searchText) {
          return true;
        }

        return (
          String(recruiter.fullname || "")
            .toLowerCase()
            .includes(searchText) ||
          String(recruiter.email || "")
            .toLowerCase()
            .includes(searchText) ||
          String(recruiter.company || "")
            .toLowerCase()
            .includes(searchText) ||
          String(recruiter.phone || "")
            .toLowerCase()
            .includes(searchText) ||
          String(recruiter.id || "")
            .toLowerCase()
            .includes(searchText)
        );
      })
    : [];

  // =====================================================
  // VIEW RECRUITER
  // =====================================================

  const viewRecruiter = (recruiter) => {
    alert(
      `Recruiter Details\n\n` +
        `ID: ${recruiter.id || "N/A"}\n` +
        `Name: ${
          recruiter.fullname || "N/A"
        }\n` +
        `Company: ${
          recruiter.company || "N/A"
        }\n` +
        `Email: ${
          recruiter.email || "N/A"
        }\n` +
        `Phone: ${
          recruiter.phone || "N/A"
        }\n` +
        `Designation: ${
          recruiter.designation || "N/A"
        }\n` +
        `Location: ${
          recruiter.location || "N/A"
        }\n` +
        `Role: ${
          recruiter.role || "job_holder"
        }`
    );
  };

  // =====================================================
  // EDIT RECRUITER
  // =====================================================

  const editRecruiter = async (recruiter) => {
    const fullname = window.prompt(
      "Enter recruiter name:",
      recruiter.fullname || ""
    );

    if (!fullname || !fullname.trim()) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      await axios.put(
        `${API_URL}/api/manager/recruiters/${recruiter.id}`,
        {
          fullname: fullname.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Recruiter updated successfully."
      );

      await fetchRecruiters();
    } catch (error) {
      console.error(
        "UPDATE RECRUITER ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to update recruiter."
      );
    }
  };

  // =====================================================
  // DELETE RECRUITER
  // =====================================================

  const deleteRecruiter = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recruiter?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      await axios.delete(
        `${API_URL}/api/manager/recruiters/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        "Recruiter deleted successfully."
      );

      await fetchRecruiters();
    } catch (error) {
      console.error(
        "DELETE RECRUITER ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete recruiter."
      );
    }
  };

  // =====================================================
  // ADD RECRUITER
  // =====================================================

  const addRecruiter = async () => {
    const fullname = window.prompt(
      "Enter recruiter name:"
    );

    if (!fullname || !fullname.trim()) {
      return;
    }

    const email = window.prompt(
      "Enter recruiter email:"
    );

    if (!email || !email.trim()) {
      return;
    }

    const company = window.prompt(
      "Enter company name:"
    );

    if (!company || !company.trim()) {
      return;
    }

    const phone = window.prompt(
      "Enter phone number:"
    );

    const password = window.prompt(
      "Enter password:"
    );

    if (!password || !password.trim()) {
      alert("Password is required.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );
        return;
      }

      console.log(
        "ADDING RECRUITER..."
      );

      const response = await axios.post(
        `${API_URL}/api/manager/add-user`,
        {
          fullname: fullname.trim(),
          email: email.trim(),
          role: "job_holder",
          password: password.trim(),
          company: company.trim(),
          phone: phone?.trim() || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "ADD RECRUITER RESPONSE:",
        response.data
      );

      alert(
        "Recruiter added successfully."
      );

      await fetchRecruiters();
    } catch (error) {
      console.error(
        "ADD RECRUITER ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        alert(
          "Authentication failed. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        alert(
          "Access denied. Your account must have manager role."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to add recruiter."
        );
      }
    }
  };

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const clearSearch = () => {
    setSearch("");
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="recruiters-container">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="recruiters-header">

        <div className="recruiters-title-section">

          <div className="recruiters-title-icon">
            <FaUserTie />
          </div>

          <div>
            <h2>Recruiters</h2>

            <p>
              Manage registered job holders
              and recruiters.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="add-recruiter-btn"
          onClick={addRecruiter}
        >
          <FaPlus />

          <span>
            Add Recruiter
          </span>
        </button>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="recruiters-summary">

        <div className="summary-card">

          <div className="summary-icon">
            <FaUserTie />
          </div>

          <div>
            <strong>
              {recruiters.length}
            </strong>

            <span>
              Total Recruiters
            </span>
          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon">
            <FaSearch />
          </div>

          <div>
            <strong>
              {filteredRecruiters.length}
            </strong>

            <span>
              Showing Results
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="recruiters-card">

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="recruiters-toolbar">

          <div className="toolbar-heading">

            <h3>
              Registered Recruiters
            </h3>

            <p>
              View and manage recruiter accounts.
            </p>

          </div>

          <div className="toolbar-actions">

            <div className="recruiter-search">

              <FaSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search recruiter, email or company..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search-btn"
                  title="Clear Search"
                  onClick={clearSearch}
                >
                  <FaTimes />
                </button>
              )}

            </div>

            <button
              type="button"
              className="refresh-recruiters-btn"
              onClick={fetchRecruiters}
              disabled={loading}
              title="Refresh Recruiters"
            >
              <FaSyncAlt
                className={
                  loading
                    ? "refresh-spinning"
                    : ""
                }
              />

              <span>
                Refresh
              </span>
            </button>

          </div>

        </div>

        {/* =================================================
            RESULT INFO
        ================================================= */}

        <div className="recruiters-result-info">
          <span>
            {filteredRecruiters.length}{" "}
            {filteredRecruiters.length === 1
              ? "Recruiter"
              : "Recruiters"}{" "}
            found
          </span>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="recruiters-table-wrapper">

          <table className="recruiters-table">

            <thead>

              <tr>
                <th className="id-column">
                  ID
                </th>

                <th>
                  Recruiter
                </th>

                <th>
                  Company
                </th>

                <th>
                  Email
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Status
                </th>

                <th className="actions-column">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="table-message"
                  >
                    <div className="table-message-content">
                      <div className="table-loader"></div>

                      <span>
                        Loading recruiters...
                      </span>
                    </div>
                  </td>

                </tr>

              ) : filteredRecruiters.length ===
                0 ? (

                /* NO DATA */

                <tr>

                  <td
                    colSpan="7"
                    className="table-message"
                  >

                    <div className="empty-recruiters">

                      <div className="empty-icon">
                        <FaUserTie />
                      </div>

                      <h3>
                        No Recruiters Found
                      </h3>

                      <p>
                        {search
                          ? "No recruiters match your search."
                          : "No recruiters are currently registered."}
                      </p>

                      {search && (
                        <button
                          type="button"
                          className="empty-clear-btn"
                          onClick={clearSearch}
                        >
                          <FaTimes />
                          Clear Search
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ) : (

                /* DATA */

                filteredRecruiters.map(
                  (recruiter) => (

                    <tr
                      key={recruiter.id}
                    >

                      {/* ID */}

                      <td className="id-cell">
                        #{recruiter.id}
                      </td>

                      {/* NAME */}

                      <td>

                        <div className="recruiter-name-cell">

                          <div className="recruiter-avatar">
                            {(
                              recruiter.fullname ||
                              "?"
                            )
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="recruiter-name-details">

                            <strong>
                              {
                                recruiter.fullname ||
                                "N/A"
                              }
                            </strong>

                            <span>
                              Job Holder
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* COMPANY */}

                      <td>

                        <span className="company-cell">
                          {
                            recruiter.company ||
                            "N/A"
                          }
                        </span>

                      </td>

                      {/* EMAIL */}

                      <td>

                        <span className="email-cell">
                          {
                            recruiter.email ||
                            "N/A"
                          }
                        </span>

                      </td>

                      {/* PHONE */}

                      <td>

                        <span className="phone-cell">
                          {
                            recruiter.phone ||
                            "N/A"
                          }
                        </span>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span className="recruiter-status">
                          <span className="status-dot"></span>
                          Active
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="actions-cell">

                        <div className="recruiter-actions">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="recruiter-action-btn view-recruiter-btn"
                            title="View Recruiter"
                            onClick={() =>
                              viewRecruiter(
                                recruiter
                              )
                            }
                          >
                            <FaEye />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            className="recruiter-action-btn edit-recruiter-btn"
                            title="Edit Recruiter"
                            onClick={() =>
                              editRecruiter(
                                recruiter
                              )
                            }
                          >
                            <FaEdit />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="recruiter-action-btn delete-recruiter-btn"
                            title="Delete Recruiter"
                            onClick={() =>
                              deleteRecruiter(
                                recruiter.id
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

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Recruiters;