import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import "./Notifications.css";

const API_URL = "http://localhost:5000";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      console.error("USER PARSE ERROR:", error);
      return null;
    }
  };

  // =====================================================
  // GET USER EMAIL
  // =====================================================

  const getUserEmail = () => {
    const user = getLoggedInUser();

    if (!user) {
      return "";
    }

    return (
      user.email ||
      user.user?.email ||
      user.data?.email ||
      ""
    )
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const email = getUserEmail();

      console.log("Notification user email:", email);

      // IMPORTANT
      // Backend requires email
      if (!email) {
        setError(
          "Unable to find your email. Please login again."
        );
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/notifications`,
        {
          params: {
            email: email,
          },
        }
      );

      console.log(
        "NOTIFICATION RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setNotifications(
          response.data.notifications || []
        );

        setUnreadCount(
          Number(response.data.unreadCount || 0)
        );
      } else {
        setError(
          response.data.message ||
            "Failed to fetch notifications"
        );
      }
    } catch (error) {
      console.error(
        "FETCH NOTIFICATIONS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // FETCH ON PAGE LOAD
  // =====================================================

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/${id}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      const email = getUserEmail();

      if (!email) {
        setError("Email is required");
        return;
      }

      await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {
          email,
        }
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "MARK ALL READ ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to mark notifications as read"
      );
    }
  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const deleteNotification = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/notifications/${id}`
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.id !== id
        )
      );

      setUnreadCount((previous) => {
        const deletedNotification =
          notifications.find(
            (notification) =>
              notification.id === id
          );

        if (
          deletedNotification &&
          !deletedNotification.is_read
        ) {
          return Math.max(0, previous - 1);
        }

        return previous;
      });
    } catch (error) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error
      );
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    try {
      return new Date(date).toLocaleString();
    } catch {
      return "";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-header">
          <div className="notifications-title">
            <div className="notifications-icon">
              <FaBell />
            </div>

            <div>
              <h1>Notifications</h1>
              <p>
                Stay updated with your applications
                and interviews
              </p>
            </div>
          </div>
        </div>

        <div className="notifications-loading">
          <FaSyncAlt className="spin" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="notifications-page">

      {/* HEADER */}

      <div className="notifications-header">

        <div className="notifications-title">

          <div className="notifications-icon">
            <FaBell />
          </div>

          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with your applications
              and interviews
            </p>
          </div>

        </div>

        <div className="notification-actions">

          {unreadCount > 0 && (
            <button
              className="mark-all-btn"
              onClick={markAllAsRead}
            >
              <FaCheck />
              Mark all as read
            </button>
          )}

          <button
            className="refresh-btn"
            onClick={fetchNotifications}
          >
            <FaSyncAlt />
            Refresh
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="notification-error">

          <div>
            <FaExclamationCircle />

            <span>{error}</span>
          </div>

          <button
            onClick={fetchNotifications}
          >
            Retry
          </button>

        </div>
      )}

      {/* CONTENT */}

      {!error && notifications.length === 0 && (
        <div className="empty-notifications">

          <div className="empty-icon">
            <FaBell />
          </div>

          <h2>No notifications</h2>

          <p>
            You don't have any notifications yet.
          </p>

        </div>
      )}

      {!error && notifications.length > 0 && (
        <div className="notifications-list">

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.is_read
                  ? "read"
                  : "unread"
              }`}
            >

              <div className="notification-card-icon">
                <FaBell />
              </div>

              <div className="notification-content">

                <div className="notification-top">

                  <h3>
                    {notification.title}
                  </h3>

                  {!notification.is_read && (
                    <span className="unread-badge">
                      New
                    </span>
                  )}

                </div>

                <p>
                  {notification.message}
                </p>

                <small>
                  {formatDate(
                    notification.created_at
                  )}
                </small>

              </div>

              <div className="notification-buttons">

                {!notification.is_read && (
                  <button
                    title="Mark as read"
                    onClick={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                  >
                    <FaCheck />
                  </button>
                )}

                <button
                  title="Delete"
                  onClick={() =>
                    deleteNotification(
                      notification.id
                    )
                  }
                >
                  <FaTrash />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Notifications;