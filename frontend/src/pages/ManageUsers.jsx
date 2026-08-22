/* =========================================================
   MANAGE USERS
   PROFESSIONAL ADMIN / JOB PORTAL
========================================================= */

import "./ManageUsers.css";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = "http://localhost:5000";

/* =========================================================
   ALLOWED ROLES
========================================================= */

const ALLOWED_ROLES = [
  "admin",
  "job_seeker",
  "manager",
  "job_holder",
];

/* =========================================================
   MANAGE USERS
========================================================= */

function ManageUsers() {
  /* =======================================================
     STATE
  ======================================================= */

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     FETCH USERS
  ======================================================= */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Fetching users from:",
        `${API_URL}/api/admin/users`
      );

      const response = await axios.get(
        `${API_URL}/api/admin/users`
      );

      console.log(
        "ADMIN USERS RESPONSE:",
        response.data
      );

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.users)
      ) {
        setUsers(response.data.users);
      } else {
        setUsers([]);

        setError(
          response.data?.message ||
            "Failed to fetch users"
        );
      }
    } catch (error) {
      console.error(
        "GET ADMIN USERS ERROR:",
        error
      );

      setUsers([]);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load users";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =======================================================
     REFRESH USERS
  ======================================================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchUsers();
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     ADD USER
  ======================================================= */

  const addUser = async () => {
    /* -----------------------------------------------------
       FULL NAME
    ----------------------------------------------------- */

    const fullname = window.prompt(
      "Enter full name"
    );

    if (!fullname || !fullname.trim()) {
      alert("Full name is required.");
      return;
    }

    /* -----------------------------------------------------
       EMAIL
    ----------------------------------------------------- */

    const email = window.prompt(
      "Enter email"
    );

    if (!email || !email.trim()) {
      alert("Email is required.");
      return;
    }

    /* -----------------------------------------------------
       ROLE
    ----------------------------------------------------- */

    const role = window.prompt(
      "Enter role:\n\nadmin\njob_seeker\nmanager\njob_holder"
    );

    if (!role || !role.trim()) {
      alert("Role is required.");
      return;
    }

    const normalizedRole = role
      .trim()
      .toLowerCase()
      .replaceAll(" ", "_");

    /* -----------------------------------------------------
       ROLE VALIDATION
    ----------------------------------------------------- */

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      alert(
        "Invalid role.\n\n" +
          "Allowed roles:\n" +
          "admin\n" +
          "job_seeker\n" +
          "manager\n" +
          "job_holder\n"
      );

      return;
    }

    /* -----------------------------------------------------
       PASSWORD
    ----------------------------------------------------- */

    const password = window.prompt(
      "Enter password"
    );

    if (!password) {
      alert("Password is required.");
      return;
    }

    /* -----------------------------------------------------
       API REQUEST
    ----------------------------------------------------- */

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          fullname: fullname.trim(),

          email: email.trim(),

          password,

          role: normalizedRole,
        }
      );

      console.log(
        "ADD USER RESPONSE:",
        response.data
      );

      if (
        response.data &&
        response.data.success !== false
      ) {
        alert(
          "User added successfully."
        );

        await fetchUsers();
      } else {
        alert(
          response.data?.message ||
            "Failed to add user"
        );
      }
    } catch (error) {
      console.error(
        "ADD USER ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to add user"
      );
    }
  };

  /* =======================================================
     EDIT USER
  ======================================================= */

  const editUser = async (user) => {
    /* -----------------------------------------------------
       FULL NAME
    ----------------------------------------------------- */

    const fullname = window.prompt(
      "Enter full name",
      user.fullname || ""
    );

    if (!fullname || !fullname.trim()) {
      return;
    }

    /* -----------------------------------------------------
       ROLE
    ----------------------------------------------------- */

    const role = window.prompt(
      "Enter role:\n\nadmin\njob_seeker\nmanager\njob_holder",
      user.role || "job_seeker"
    );

    if (!role || !role.trim()) {
      return;
    }

    const normalizedRole = role
      .trim()
      .toLowerCase()
      .replaceAll(" ", "_");

    /* -----------------------------------------------------
       ROLE VALIDATION
    ----------------------------------------------------- */

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      alert(
        "Invalid role.\n\n" +
          "Allowed roles:\n" +
          "admin\n" +
          "job_seeker\n" +
          "manager\n" +
          "job_holder"
      );

      return;
    }

    /* -----------------------------------------------------
       UPDATE REQUEST
    ----------------------------------------------------- */

    try {
      const response = await axios.put(
        `${API_URL}/api/admin/users/${user.id}`,
        {
          fullname: fullname.trim(),

          role: normalizedRole,

          phone: user.phone || "",

          location: user.location || "",
        }
      );

      console.log(
        "UPDATE USER RESPONSE:",
        response.data
      );

      if (
        response.data &&
        response.data.success
      ) {
        alert(
          "User updated successfully."
        );

        await fetchUsers();
      } else {
        alert(
          response.data?.message ||
            "Update failed"
        );
      }
    } catch (error) {
      console.error(
        "UPDATE USER ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Update failed"
      );
    }
  };

  /* =======================================================
     DELETE USER
  ======================================================= */

  const deleteUser = async (id) => {
    if (!id) {
      alert("User ID is missing.");
      return;
    }

    /* -----------------------------------------------------
       CONFIRMATION
    ----------------------------------------------------- */

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    /* -----------------------------------------------------
       DELETE REQUEST
    ----------------------------------------------------- */

    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/users/${id}`
      );

      console.log(
        "DELETE USER RESPONSE:",
        response.data
      );

      if (
        response.data &&
        response.data.success
      ) {
        alert(
          "User deleted successfully."
        );

        await fetchUsers();
      } else {
        alert(
          response.data?.message ||
            "Failed to delete user"
        );
      }
    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete user"
      );
    }
  };

  /* =======================================================
     SEARCH USERS
  ======================================================= */

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const searchText = search
          .toLowerCase()
          .trim();

        if (!searchText) {
          return true;
        }

        return (
          user.fullname
            ?.toLowerCase()
            .includes(searchText) ||

          user.email
            ?.toLowerCase()
            .includes(searchText) ||

          user.role
            ?.toLowerCase()
            .includes(searchText) ||

          user.phone
            ?.toLowerCase()
            .includes(searchText) ||

          user.location
            ?.toLowerCase()
            .includes(searchText)
        );
      })
    : [];

  /* =======================================================
     FORMAT ROLE
  ======================================================= */

  const formatRole = (role) => {
    if (!role) {
      return "Unknown";
    }

    const normalized = String(role)
      .trim()
      .toLowerCase();

    if (normalized === "job_seeker") {
      return "Job Seeker";
    }

    if (normalized === "job_holder") {
      return "Job Holder";
    }

    if (normalized === "manager") {
      return "Manager";
    }

    if (normalized === "admin") {
      return "Admin";
    }

    return normalized
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  /* =======================================================
     ROLE CLASS
  ======================================================= */

  const getRoleClass = (role) => {
    if (!role) {
      return "";
    }

    return String(role)
      .trim()
      .toLowerCase()
      .replaceAll(" ", "_");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="users-page">

      <div className="users-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="users-header">

          <div className="users-header-content">

            <h1>
              Manage Users
            </h1>

            <p>
              Manage all registered users
              on the job portal.
            </p>

          </div>

          <div className="users-header-actions">

            {/* REFRESH */}

            <button
              type="button"
              className="refresh-users-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh users"
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

            {/* ADD USER */}

            <button
              type="button"
              className="add-user-btn"
              onClick={addUser}
            >

              <FaPlus />

              Add User

            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="users-error">

            <strong>
              Failed to load users:
            </strong>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={fetchUsers}
            >
              Try Again
            </button>

          </div>
        )}

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="users-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search by name, email, role, phone or location..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        {!loading && !error && (
          <div className="users-count">

            Showing{" "}

            <strong>
              {filteredUsers.length}
            </strong>{" "}

            of{" "}

            <strong>
              {users.length}
            </strong>{" "}

            users

          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Full Name
                </th>

                <th>
                  Email Address
                </th>

                <th>
                  Role
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (
                <tr>

                  <td
                    colSpan="6"
                    className="table-message"
                  >

                    <div className="loading-container">
                      Loading users...
                    </div>

                  </td>

                </tr>

              ) : filteredUsers.length === 0 ? (

                /* =================================================
                   EMPTY
                ================================================= */

                <tr>

                  <td
                    colSpan="6"
                    className="table-message"
                  >

                    {search
                      ? "No users match your search."
                      : "No users found."}

                  </td>

                </tr>

              ) : (

                /* =================================================
                   USERS
                ================================================= */

                filteredUsers.map((user) => (

                  <tr key={user.id}>

                    {/* ID */}

                    <td>
                      {user.id}
                    </td>

                    {/* NAME */}

                    <td>

                      <strong>
                        {user.fullname ||
                          "N/A"}
                      </strong>

                    </td>

                    {/* EMAIL */}

                    <td>

                      {user.email ||
                        "N/A"}

                    </td>

                    {/* ROLE */}

                    <td>

                      <span
                        className={`role-badge ${getRoleClass(
                          user.role
                        )}`}
                      >

                        {formatRole(
                          user.role
                        )}

                      </span>

                    </td>

                    {/* STATUS */}

                    <td>

                      <span className="status-badge">
                        Active
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit User"
                          onClick={() =>
                            editUser(user)
                          }
                        >

                          <FaEdit />

                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete User"
                          onClick={() =>
                            deleteUser(
                              user.id
                            )
                          }
                        >

                          <FaTrash />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default ManageUsers;