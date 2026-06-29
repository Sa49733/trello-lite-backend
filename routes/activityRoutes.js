const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
getProjectActivities,
} = require("../controllers/activityController");

// Get All Activities of a Project
router.get("/:projectId", protect, getProjectActivities);

module.exports = router;
