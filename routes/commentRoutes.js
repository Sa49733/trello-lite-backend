const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

// Create Comment
router.post("/", protect, createComment);

// Get Comments of a Task
router.get("/:taskId", protect, getCommentsByTask);

// Update Comment
router.put("/:id", protect, updateComment);
// delete comment
router.delete("/:id", protect, deleteComment);

module.exports = router;
