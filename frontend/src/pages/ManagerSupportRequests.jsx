import React, { useEffect, useState } from "react";
import {
  FaTrash,
  FaCheck,
  FaClock,
} from "react-icons/fa";
import "./ManagerSupportRequests.css";

const API_URL = "http://localhost:5000";

function ManagerSupportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH MANAGER SUPPORT REQUESTS
  // GET /api/support/manager
  // =====================================================

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Fetching manager support requests..."
      );

      const response = await fetch(
        `${API_URL}/api/support/manager`
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned invalid response. HTTP ${response.status}: ${text}`
        );
      }

      console.log(
        "Manager support response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Server error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch manager support requests"
        );
      }

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      );
    } catch (error) {
      console.error(
        "FETCH MANAGER SUPPORT ERROR:",
        error
      );

      setError(
        error.message ||
          "Unable to fetch support requests"
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
  // PUT /api/support/:id
  // =====================================================

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API_URL}/api/support/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Invalid server response. HTTP ${response.status}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update support request"
        );
      }

      await fetchRequests();
    } catch (error) {
      console.error(
        "UPDATE SUPPORT ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to update support request"
      );
    }
  };

  // =====================================================
  // DELETE
  // DELETE /api/support/:id
  // =====================================================

  const deleteRequest = async (id) => {
    const confirmed = window.confirm(
      "Delete this support request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/support/${id}`,
        {
          method: "DELETE",
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Invalid server response. HTTP ${response.status}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete support request"
        );
      }

      setRequests((previous) =>
        previous.filter(
          (item) =>
            Number(item.id) !== Number(id)
        )
      );
    } catch (error) {
      console.error(
        "DELETE SUPPORT ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to delete support request"
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="manager-requests-page">
        <div className="manager-empty">
          <h2>
            Loading support requests...
          </h2>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="manager-requests-page">

      {/* HEADER */}
      <div className="manager-requests-header">
        <div>
          <h1>
            Job Seeker Support
          </h1>

          <p>
            Job-related questions and
            requests from job seekers.
          </p>
        </div>

        <div className="manager-request-count">
          {requests.length}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="manager-request-error">
          <div>
            <strong>
              Failed to load support requests
            </strong>

            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
          >
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!error &&
        requests.length === 0 && (
          <div className="manager-empty">
            <h3>
              No support requests
            </h3>

            <p>
              Job-related requests from
              job seekers will appear here.
            </p>
          </div>
        )}

      {/* TABLE */}
      {!error &&
        requests.length > 0 && (
          <div className="manager-request-table-wrapper">

            <table className="manager-request-table">

              <thead>
                <tr>
                  <th>Job Seeker</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>

                    {/* EMAIL */}
                    <td>
                      <strong>
                        {request.email || "—"}
                      </strong>
                    </td>

                    {/* SUBJECT */}
                    <td>
                      {request.subject || "—"}
                    </td>

                    {/* MESSAGE */}
                    <td>
                      <div className="request-message">
                        {request.message || "—"}
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td>
                      {request.category || "general"}
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`request-status ${
                          request.status || "pending"
                        }`}
                      >
                        {request.status
                          ? request.status
                              .replace("_", " ")
                              .replace(/\b\w/g, (char) =>
                                char.toUpperCase()
                              )
                          : "Pending"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td>
                      {request.created_at
                        ? new Date(
                            request.created_at
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="request-actions">

                        <button
                          type="button"
                          title="Mark In Progress"
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
                          type="button"
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
                          type="button"
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
                ))}
              </tbody>

            </table>

          </div>
        )}
    </div>
  );
}

export default ManagerSupportRequests;