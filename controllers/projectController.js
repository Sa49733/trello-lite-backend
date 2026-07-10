const Project = require("../models/Project");
const User = require("../models/User");

const {
  createActivity,
} = require("./activityController");

// Create Project
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user.id,
    });

    await createActivity(
      `Created project "${project.title}"`,
      project._id,
      req.user.id
    );

    res.status(201).json(project);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      createdBy: req.user.id,
    });

    res.status(200).json(projects);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Project By ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Project
const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },
      {
        title,
        description,
      },
      {
        new: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await createActivity(
      `Updated project "${project.title}"`,
      project._id,
      req.user.id
    );

    res.status(200).json(project);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await createActivity(
      `Deleted project "${project.title}"`,
      project._id,
      req.user.id
    );

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Member
const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only project owner can add members",
      });
    }

    const alreadyMember = project.members.some(
      (member) => member.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

    project.members.push({
      user: user._id,
      role: "Member",
    });

    await project.save();

    await createActivity(
      `Added ${user.name} to the project`,
      project._id,
      req.user.id
    );

    res.status(200).json(project);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Project Members
const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove Member
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only project owner can remove members",
      });
    }

    project.members = project.members.filter(
      (member) =>
        member.user.toString() !== req.params.memberId
    );

    await project.save();

    await createActivity(
      "Removed a member from the project",
      project._id,
      req.user.id
    );

    res.status(200).json(project);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  getProjectMembers,
  removeMember,
};