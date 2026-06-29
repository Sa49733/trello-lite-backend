const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createTask,
  getAllTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  assignTask,
} = require("../controllers/taskController");

// Create Task
router.post("/", protect, createTask);

// Get All Tasks
router.get("/", protect, getAllTasks);

// Get Tasks By Project
router.get("/project/:projectId", protect, getTasksByProject);

// Update Task
router.put("/:id", protect, updateTask);

// Assign Task
router.put("/:id/assign", protect, assignTask);

// Delete Task
router.delete("/:id", protect, deleteTask);

module.exports = router;