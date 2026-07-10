const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");

const {
  createActivity,
} = require("./activityController");
const {
  createNotification,
} = require("./notificationController");

// ==============================
// Create Task
// ==============================

const createTask = async (req, res) => {
  try {

    const {
      title,
      description,
      priority,
      dueDate,
      project,
      assignedTo,
    } = req.body;

    const attachments = req.files
      ? req.files.map((file) => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        }))
      : [];

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      project,
      assignedTo: assignedTo || null,
      attachments,
      createdBy: req.user.id,
    });

    // Activity Log

    await createActivity(
      `Created task "${task.title}"`,
      task.project,
      req.user.id
    );

    const populatedTask =
      await Task.findById(task._id)
        .populate("project", "title")
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "createdBy",
          "name email avatar"
        );

    res.status(201).json(
      populatedTask
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};
// Get All Tasks
// ==============================

const getAllTasks = async (req, res) => {
  try {
    const page =
      Number(req.query.page) || 1;

    const limit =
      Number(req.query.limit) || 10;

    const skip =
      (page - 1) * limit;

    // ==========================
    // Owner sees created tasks
    // Member sees assigned tasks
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

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.priority) {
      filter.priority =
        req.query.priority;
    }

    if (req.query.keyword) {
      filter.title = {
        $regex:
          req.query.keyword,
        $options: "i",
      };
    }

    const sort =
      req.query.sort ||
      "-createdAt";

    const tasks =
      await Task.find(filter)
        .populate(
          "project",
          "title"
        )
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "createdBy",
          "name email avatar"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const totalTasks =
      await Task.countDocuments(
        filter
      );

    res.status(200).json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(
        totalTasks / limit
      ),
      totalTasks,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// ==============================
// Get Tasks By Project
// ==============================

const getTasksByProject = async (
  req,
  res
) => {
  try {

    const tasks = await Task.find({
      project: req.params.projectId,

      $or: [
        {
          createdBy: req.user.id,
        },
        {
          assignedTo: req.user.id,
        },
      ],
    })
      .populate(
        "project",
        "title"
      )
      .populate(
        "assignedTo",
        "name email avatar"
      )
      .populate(
        "createdBy",
        "name email avatar"
      );

    res.status(200).json(tasks);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};
// ==============================
// Update Task
// ==============================

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
    } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,

      $or: [
        {
          createdBy: req.user.id,
        },
        {
          assignedTo: req.user.id,
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // ==========================
    // Check Permission
    // ==========================

    const isOwner =
      task.createdBy.toString() ===
      req.user.id;

    // ==========================
    // Owner can edit everything
    // ==========================

    if (isOwner) {
      task.title = title;
      task.description =
        description;
      task.priority = priority;
      task.dueDate = dueDate;
      task.project = project;
      task.assignedTo =
        assignedTo || null;
    }

    // ==========================
    // Both Owner & Member
    // ==========================

    if (status) {
      task.status = status;
    }

    // ==========================
    // Upload Attachments
    // ==========================

    if (
      req.files &&
      req.files.length > 0
    ) {
      const newAttachments =
        req.files.map((file) => ({
          filename:
            file.filename,
          originalname:
            file.originalname,
          path: file.path,
          mimetype:
            file.mimetype,
          size: file.size,
        }));

      task.attachments.push(
        ...newAttachments
      );
    }

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "project",
          "title"
        )
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "createdBy",
          "name email avatar"
        );
      await createActivity(
  `Updated task "${task.title}"`,
  task.project,
  req.user.id
);

// ==========================
// Notify Owner
// ==========================

const isMember =
  task.createdBy.toString() !==
  req.user.id;

if (isMember) {

  await createNotification({

    user: task.createdBy,

    title: "Task Submitted",

    message: `${updatedTask.assignedTo?.name || "A member"} submitted work for "${task.title}".`,

    task: task._id,

    project: task.project,

  });

}

res.status(200).json(
  updatedTask
);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// ==============================
// Delete Task
// ==============================

const deleteTask = async (req, res) => {
  try {

    const task = await Task.findOne({
      _id: req.params.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // ==========================
    // Only Owner Can Delete
    // ==========================

    if (
      task.createdBy.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "Only the task owner can delete this task.",
      });
    }

    await Task.findByIdAndDelete(
      task._id
    );

    // ==========================
    // Activity Log
    // ==========================

    await createActivity(
      `Deleted task "${task.title}"`,
      task.project,
      req.user.id
    );

    res.status(200).json({
      message:
        "Task deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};
// ==============================
// Assign Task
// ==============================

const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

const user = await User.findById(
  assignedTo
);

if (!user) {
  return res.status(404).json({
    message: "User not found",
  });
}

    

    // ==========================
    // Find Task
    // ==========================

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // ==========================
    // Find Project
    // ==========================

    const project = await Project.findById(
      task.project
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // ==========================
    // Check Membership
    // ==========================

    const isOwner =
      project.createdBy.toString() ===
      user._id.toString();

    const isMember =
      project.members.some(
        (member) =>
          member.user &&
          member.user.toString() ===
            user._id.toString()
      );

    if (!isOwner && !isMember) {
      return res.status(400).json({
        message:
          "User is not a member of this project",
      });
    }

    // ==========================
    // Assign Task
    // ==========================

    task.assignedTo = user._id;

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "project",
          "title"
        )
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "createdBy",
          "name email avatar"
        );

    // ==========================
    // Activity Log
    // ==========================

    await createActivity(
      `Assigned task "${task.title}" to ${user.name}`,
      task.project,
      req.user.id
    );
    // ==========================
// Create Notification
// ==========================

await createNotification({
  user: user._id,
  title: "New Task Assigned",
  message: `${task.title} has been assigned to you.`,
  task: task._id,
  project: task.project,
});

    res.status(200).json(
      updatedTask
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};

// ==============================
// Export Controllers
// ==============================

module.exports = {
  createTask,
  getAllTasks,
  getTasksByProject,
  updateTask,
  deleteTask,
  assignTask,
};