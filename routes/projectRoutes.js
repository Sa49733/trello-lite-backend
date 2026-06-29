const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  getProjectMembers,
  removeMember,
} = require("../controllers/projectController");

// Create Project
router.post("/", protect, createProject);

// Get All Projects
router.get("/", protect, getProjects);

// Get Project By ID
router.get("/:id", protect, getProjectById);

// Update Project
router.put("/:id", protect, updateProject);

// Delete Project
router.delete("/:id", protect, deleteProject);

// Add Member to Project
router.post("/:id/members", protect, addMember);

router.get("/:id/members", protect, getProjectMembers);
// for removing the member
router.delete(
  "/:projectId/members/:memberId",
  protect,
  removeMember
);

module.exports = router;
