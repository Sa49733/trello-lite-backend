const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const uploadAttachment = require("../middleware/uploadAttachment");

const {
  createTask,
  getAllTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  assignTask,
} = require("../controllers/taskController");

// ==============================
// Create Task (with attachment)
// ==============================

router.post(
  "/",
  protect,
  uploadAttachment.array("attachments", 5),
  createTask
);

// ==============================
// Get All Tasks
// ==============================

router.get(
  "/",
  protect,
  getAllTasks
);

// ==============================
// Get Tasks By Project
// ==============================

router.get(
  "/project/:projectId",
  protect,
  getTasksByProject
);

// ==============================
// Update Task (with attachment)
// ==============================

router.put(
  "/:id",
  protect,
  uploadAttachment.array("attachments", 5),
  updateTask
);

// ==============================
// Delete Task
// ==============================

router.delete(
  "/:id",
  protect,
  deleteTask
);

// ==============================
// Assign Task
// ==============================

router.put(
  "/assign/:id",
  protect,
  assignTask
);

module.exports = router;