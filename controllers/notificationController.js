const Notification = require("../models/Notification");

// ==============================
// Create Notification
// ==============================

const createNotification = async ({
  user,
  title,
  message,
  task = null,
  project = null,
}) => {
  try {

    console.log(
      "Creating notification for:",
      user.toString()
    );

    await Notification.create({
      user,
      title,
      message,
      task,
      project,
    });

    console.log(
      "Notification created successfully"
    );

  } catch (error) {

    console.log(
      "Notification Error:",
      error
    );

  }
};

// ==============================
// Get My Notifications
// ==============================

const getNotifications = async (
  req,
  res
) => {

  try {

    const notifications =
      await Notification.find({
        user: req.user.id,
      })
        .populate(
          "task",
          "title"
        )
        .populate(
          "project",
          "title"
        )
        .sort("-createdAt");

    res.status(200).json(
      notifications
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// ==============================
// Mark Notification as Read
// ==============================

const markAsRead = async (
  req,
  res
) => {

  try {

    const notification =
      await Notification.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!notification) {

      return res.status(404).json({
        message:
          "Notification not found",
      });

    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      message:
        "Notification marked as read",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// ==============================
// Mark All Notifications Read
// ==============================

const markAllRead = async (
  req,
  res
) => {

  try {

    await Notification.updateMany(
      {
        user: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      message:
        "All notifications marked as read",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// ==============================
// Delete Notification
// ==============================

const deleteNotification =
  async (req, res) => {

    try {

      const notification =
        await Notification.findOneAndDelete({
          _id: req.params.id,
          user: req.user.id,
        });

      if (!notification) {

        return res.status(404).json({
          message:
            "Notification not found",
        });

      }

      res.status(200).json({
        message:
          "Notification deleted",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message,
      });

    }

  };

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
};
