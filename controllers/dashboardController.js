const Project = require("../models/Project");
const Task = require("../models/Task");

const getDashboard = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({
      createdBy: req.user.id,
    });

    const totalTasks = await Task.countDocuments({
      createdBy: req.user.id,
    });

    const todoTasks = await Task.countDocuments({
      createdBy: req.user.id,
      status: "Todo",
    });

    const inProgressTasks = await Task.countDocuments({
      createdBy: req.user.id,
      status: "In Progress",
    });

    const doneTasks = await Task.countDocuments({
      createdBy: req.user.id,
      status: "Done",
    });

    res.status(200).json({
      totalProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};