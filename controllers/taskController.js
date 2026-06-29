const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");

const {
  createActivity,
} = require("./activityController");


// Create Task

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      project,
    } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      project,
      createdBy: req.user.id,
    });

    // Activity Log
    await createActivity(
      `Created task "${task.title}"`,
      task.project,
      req.user.id
    );

    res.status(201).json(task);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// Get All Tasks

const getAllTasks = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const filter = {
      createdBy: req.user.id,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    if (req.query.keyword) {
      filter.title = {
        $regex: req.query.keyword,
        $options: "i",
      };
    }

    const sort = req.query.sort || "-createdAt";

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments(filter);

    res.status(200).json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// Get Tasks By Project

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
      createdBy: req.user.id,
    }).populate("assignedTo", "name email");

    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// Update Task

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
    } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
      },
      {
        title,
        description,
        status,
        priority,
        dueDate,
      },
      {
        new: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Activity Log
    await createActivity(
      `Updated task "${task.title}"`,
      task.project,
      req.user.id
    );

    res.status(200).json(task);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Task

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Activity Log
    await createActivity(
      `Deleted task "${task.title}"`,
      task.project,
      req.user.id
    );

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Assign Task

const assignTask = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find task
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Find project
    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if user belongs to the project
    const isMember =
      project.createdBy.toString() === user._id.toString() ||
      project.members.some(
        (memberId) => memberId.toString() === user._id.toString()
      );

    if (!isMember) {
      return res.status(400).json({
        message: "User is not a member of this project",
      });
    }

    // Assign task
    task.assignedTo = user._id;

    await task.save();

    // Activity Log
    await createActivity(
      `Assigned task "${task.title}" to ${user.name}`,
      task.project,
      req.user.id
    );

    res.status(200).json(task);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  assignTask,
};