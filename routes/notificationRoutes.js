const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} = require("../controllers/notificationController");

// ==============================
// Get My Notifications
// ==============================

router.get(
  "/",
  authMiddleware,
  getNotifications
);

// ==============================
// Mark All Notifications Read
// ==============================

router.put(
  "/read-all",
  authMiddleware,
  markAllRead
);

// ==============================
// Mark As Read
// ==============================

router.put(
  "/:id/read",
  authMiddleware,
  markAsRead
);

// ==============================
// Delete Notification
// ==============================

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;