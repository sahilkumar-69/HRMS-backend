import { Notification } from "../models/notification.model.js";

/**
 * Create a notification
 */
export const createNotification = async (req, res) => {
  try {
    const { recipient, title, message, type, relatedEntity, entityModel } =
      req.body;

    const notification = await Notification.create({
      recipient,
      sender: req.user._id, // from auth middleware
      title,
      message,
      type,
      relatedEntity,
      entityModel,
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
    });
  }
};

/**
 * Get notifications for logged-in user
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    }).sort({ createdAt: -1 });
    // .populate("sender", "FirstName LastName Email Role");

    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating notification",
      error: error.message,
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { ids } = req.body;

    const { _id } = req.user;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No notification IDs provided" });
    }

    // Mark all given notifications as read
    const result = await Notification.updateMany(
      { _id: { $in: ids } },
      { $set: { isRead: true } }
    );

    const allNotifications = await Notification.find({
      recipient: _id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount,
      notifications: allNotifications,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};
