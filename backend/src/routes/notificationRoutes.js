
const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadNotificationCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// =====================================================
// GET ALL NOTIFICATIONS
// GET /api/notifications?email=xxx
// =====================================================

router.get(
  "/",
  getNotifications
);

// =====================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count?email=xxx
// =====================================================

router.get(
  "/unread-count",
  getUnreadNotificationCount
);

// =====================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =====================================================

router.patch(
  "/read-all",
  markAllAsRead
);

// =====================================================
// MARK ONE AS READ
// PATCH /api/notifications/:id/read
// =====================================================

router.patch(
  "/:id/read",
  markAsRead
);

// =====================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// =====================================================

router.delete(
  "/:id",
  deleteNotification
);

module.exports = router;