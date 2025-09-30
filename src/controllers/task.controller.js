import Task from "../models/task.model.js";
import { userModel as User } from "../models/User.model.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { sendNotification } from "../utils/sendNotification.js";

const createTask = async (req, res) => {
  let docs = [];

  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignee,
      assigner,
      status,
    } = req.body;

    //  Validate required fields
    if (
      !title ||
      !description ||
      !priority ||
      !dueDate ||
      !assigner ||
      !assignee ||
      !Array.isArray(assignee) ||
      assignee.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or choose at least one assignee",
      });
    }

    //  Validate assignees
    const validatedAssignees = await User.find({ _id: { $in: assignee } });
    if (validatedAssignees.length !== assignee.length) {
      return res.json({
        success: false,
        message: "One or more assignees not found",
      });
    }

    //  Validate assigner
    const assignerUser = await User.findById(assigner);
    if (!assignerUser) {
      return res
        .status(404)
        .json({ success: false, message: "Assigner not found" });
    }

    //  Upload attachments to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadOnCloudinary(file.path, "HRMS_TASK_FILES")
        )
      );

      docs = uploads
        .filter((u) => u.success)
        .map((u) => ({
          public_id: u.response.public_id,
          secure_url: u.response.secure_url,
        }));
    }

    //  Create Task
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignee,
      assigner,
      status,
      docs,
    });

    //  Link task to assignees
    await assignTask(task._id, assignee);

    //  Send notification to all assignees
    await sendNotification({
      recipients: assignee, // array of userIds
      title: "New Task Assigned",
      message: `New task "${task.title}" assigned by ${assignerUser.FirstName} ${assignerUser.LastName}`,
      data: {
        taskId: task._id,
        priority: task.priority,
        dueDate: task.dueDate,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    //  Rollback uploaded files if any failure
    if (docs.length > 0) {
      await Promise.all(
        docs.map((file) => deleteFromCloudinary(file.public_id))
      );
    }

    return res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

// Get all tasks (or filter by role/assignee)
const getTasks = async (req, res) => {
  try {
    let query = {};

    // If employee → show only their tasks
    // if (req.user.role === "EMPLOYEE") {
    //   query.assignee = req.user._id;
    // }

    // HR, TL, Owner can see all tasks
    const tasks = await Task.find()
      .populate("assignee", "FirstName LastName Email Role")
      .populate("assigner", "FirstName LastName Email Role")
      // .populate("assigner", "FirstName LastName Email Role")
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
};

const deleteTasks = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id).populate(
      "assignee",
      "_id FirstName LastName"
    );

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    //  Notify all assignees that their task was deleted
    if (deletedTask.assignee && deletedTask.assignee.length > 0) {
      await sendNotification({
        recipients: deletedTask.assignee.map((a) => a._id.toString()),
        title: "Task Deleted",
        message: `The task "${deletedTask.title}" has been deleted by the manager.`,
        data: { taskId: deletedTask._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while deleting task",
      error: err.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    //  Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    //  Validate assignee(s) if updated
    if (updates.assignee) {
      const assignees = Array.isArray(updates.assignee)
        ? updates.assignee
        : [updates.assignee];
      const found = await User.find({ _id: { $in: assignees } });
      if (found.length !== assignees.length) {
        return res.status(404).json({
          success: false,
          message: "One or more assignees not found",
        });
      }
    }

    //  Validate assigner if updated
    if (updates.assigner) {
      const assignerUser = await User.findById(updates.assigner);
      if (!assignerUser) {
        return res.status(404).json({
          success: false,
          message: "Assigner not found",
        });
      }
    }

    //  Update task
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    //  Notify all current assignees of the update
    if (updatedTask.assignee && updatedTask.assignee.length > 0) {
      await sendNotification({
        recipients: updatedTask.assignee.map((a) => a.toString()),
        title: "Task Updated",
        message: `The task "${updatedTask.title}" has been updated.`,
        data: { taskId: updatedTask._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

// Get all tasks assigned to an employee
const getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const tasks = await Task.find({ assignee: employeeId })
      .populate("assignee", "name email") // optional: include employee info
      .populate("assigner", "name email");

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching employee tasks",
      error: error.message,
    });
  }
};

const assignTask = async (taskId, to) => {
  try {
    //  Add the task to the user (no duplicates)
    const updatedUser = await User.findByIdAndUpdate(
      to,
      { $addToSet: { Tasks: taskId } },
      { new: true }
    ).populate("Tasks", "title description priority dueDate status");

    if (!updatedUser) {
      throw new Error("User not found for task assignment");
    }

    //  Send notification to the assigned user
    await sendNotification({
      recipients: [to.toString()],
      title: "New Task Assigned",
      message: `You have been assigned a new task.`,
      data: { taskId },
    });

    return updatedUser;
  } catch (error) {
    throw new Error("Error assigning task: " + error.message);
  }
};

export {
  createTask,
  getTasks,
  deleteTasks,
  updateTask,
  getEmployeeTasks,
  assignTask,
};
