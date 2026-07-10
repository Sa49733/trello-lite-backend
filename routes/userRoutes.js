const express = require("express");

const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// ==============================
// Get Logged In User
// ==============================

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// ==============================
// Update Profile
// ==============================

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// ==============================
// Change Password
// ==============================

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// ==============================
// Upload Avatar
// ==============================

router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  uploadAvatar
);

module.exports = router;