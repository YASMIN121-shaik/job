import React, {
  useEffect,
  useState,
} from "react";

import {
  FaTrash,
  FaCheck,
  FaClock,
} from "react-icons/fa";

import "./AdminSupportRequests.css";

const API_URL =
  "http://localhost:5000";

function AdminSupportRequests() {
  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH ADMIN REQUESTS
  // =====================================================

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/support/admin`
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to fetch requests"
        );
      }

      setRequests(
        data.requests || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to fetch requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/support/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update request"
        );
      }

      await fetchRequests();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteRequest = async (
    id
  ) => {
    if (
      !window.confirm(
        "Delete this support request?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/support/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to delete request"
        );
      }

      setRequests(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  if (loading) {
    return (
      <div className="admin-support-page">
        <h2>
          Loading support requests...
        </h2>
      </div>
    );
  }

  return (
    <div className="admin-support-page">

      <div className="admin-support-header">

        <div>
          <h1>
            Account & Login Support
          </h1>

          <p>
            Login, registration, password
            and account requests from
            job seekers.
          </p>
        </div>

        <div className="admin-support-count">
          {requests.length}
        </div>

      </div>

      {error && (
        <div className="admin-support-error">
          {error}

          <button
            onClick={fetchRequests}
          >
            Try Again
          </button>
        </div>
      )}

      {!error &&
        requests.length === 0 && (
          <div className="admin-support-empty">

            <h3>
              No support requests
            </h3>

            <p>
              Login and account requests
              will appear here.
            </p>

          </div>
        )}

      {!error &&
        requests.length > 0 && (
          <div className="admin-support-table-wrapper">

            <table className="admin-support-table">

              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {requests.map(
                  (request) => (
                    <tr
                      key={request.id}
                    >

                      <td>
                        {request.email}
                      </td>

                      <td>
                        {request.subject ||
                          "—"}
                      </td>

                      <td>
                        <div className="admin-request-message">
                          {request.message}
                        </div>
                      </td>

                      <td>
                        {request.category ||
                          "account"}
                      </td>

                      <td>
                        <span
                          className={`admin-request-status ${request.status}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td>
                        {request.created_at
                          ? new Date(
                              request.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </td>

                      <td>

                        <div className="admin-request-actions">

                          <button
                            title="In Progress"
                            onClick={() =>
                              updateStatus(
                                request.id,
                                "in_progress"
                              )
                            }
                          >
                            <FaClock />
                          </button>

                          <button
                            title="Resolve"
                            onClick={() =>
                              updateStatus(
                                request.id,
                                "resolved"
                              )
                            }
                          >
                            <FaCheck />
                          </button>

                          <button
                            title="Delete"
                            onClick={() =>
                              deleteRequest(
                                request.id
                              )
                            }
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

    </div>
  );
}

export default AdminSupportRequests;