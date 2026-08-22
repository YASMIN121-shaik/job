const notificationModel = require("../models/notificationModel");

// =====================================================
// GET NOTIFICATIONS
// GET /api/notifications?email=xxx
// =====================================================

const getNotifications = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const notifications =
      await notificationModel.findByEmail(
        email.trim()
      );

    const unreadCount =
      notifications.filter(
        (notification) =>
          notification.is_read === false
      ).length;

    return res.json({
      success: true,
      notifications,
      total: notifications.length,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// =====================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count?email=xxx
// =====================================================

const getUnreadNotificationCount = async (
  req,
  res
) => {
  try {
    const { email } = req.query;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const unreadCount =
      await notificationModel.getUnreadCount(
        email.trim()
      );

    return res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET UNREAD NOTIFICATION COUNT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch unread notification count",
      error: error.message,
    });
  }
};

// =====================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================================

const markAsRead = async (req, res) => {
  try {
    const notificationId = Number(
      req.params.id
    );

    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification =
      await notificationModel.markAsRead(
        notificationId
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "MARK READ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================================

const markAllAsRead = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const updatedCount =
      await notificationModel.markAllAsRead(
        email.trim()
      );

    return res.json({
      success: true,
      message:
        "All notifications marked as read",
      updatedCount,
    });
  } catch (error) {
    console.error(
      "MARK ALL READ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================================

const deleteNotification = async (
  req,
  res
) => {
  try {
    const notificationId = Number(
      req.params.id
    );

    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification =
      await notificationModel.remove(
        notificationId
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Notification deleted successfully",
      notification,
    });
  } catch (error) {
    console.error(
      "DELETE NOTIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete notification",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE NOTIFICATION
// Used by other controllers
// =====================================================

const createNotification = async ({
  email,
  type = "system",
  title,
  message,
}) => {
  try {
    if (
      !email ||
      !email.trim() ||
      !title ||
      !message
    ) {
      console.error(
        "CREATE NOTIFICATION: Missing required fields"
      );

      return null;
    }

    return await notificationModel.create({
      email: email.trim(),
      type,
      title,
      message,
    });
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
      error
    );

    return null;
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};