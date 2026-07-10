const Project = require("../models/Project");
const Task = require("../models/Task");

const getDashboard = async (req, res) => {
  try {

    // ==========================
    // Projects
    // ==========================

    const totalProjects =
      await Project.countDocuments({
        $or: [
          {
            createdBy: req.user.id,
          },
          {
            "members.user": req.user.id,
          },
        ],
      });

    // ==========================
    // Tasks
    // ==========================

    const filter = {
      $or: [
        {
          createdBy: req.user.id,
        },
        {
          assignedTo: req.user.id,
        },
      ],
    };

    const totalTasks =
      await Task.countDocuments(filter);

    const todoTasks =
      await Task.countDocuments({
        ...filter,
        status: "Todo",
      });

    const inProgressTasks =
      await Task.countDocuments({
        ...filter,
        status: "In Progress",
      });

    const doneTasks =
      await Task.countDocuments({
        ...filter,
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

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  getDashboard,
};