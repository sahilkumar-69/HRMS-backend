import Task from "../models/task.js";
import { userModel as User } from "../models/User.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { assignTask } from "./authentication.js";

const createTask = async (req, res) => {
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

    // console.log(req.body);
    // Validate required fields
    if (
      !title ||
      !description ||
      !priority ||
      !dueDate ||
      !assigner ||
      !status
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    //  Validate assignee exists
    // const assigneeUser = await User.findById(assignee);
    // if (!assigneeUser) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "Assignee not found" });
    // }

    //  Validate assigner exists
    const assignerUser = await User.findById(assigner);
    if (!assignerUser) {
      return res
        .status(404)
        .json({ success: false, message: "Assigner not found" });
    }

    if (!assignee) {
      return res
        .status(404)
        .json({ success: false, message: "Assignee not found" });
    }

    var docs = [];

    if (req.files && req.files.length > 0) {
      // Wait for all uploads in parallel
      const uploads = await Promise.all(
        req.files.map(async (file) =>
          uploadOnCloudinary(file.path, "HRMS_TASK_FILES")
        )
      );

      // Filter successful uploads
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
      docs: docs || [],
    });

    await assignTask(task._id, assignee);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    await Promise.all(
      docs.map(async (cloudObj) => deleteFromCloudinary(cloudObj.public_id))
    );
    res.status(500).json({
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
    if (req.user.role === "employee") {
      query.assignee = req.user.id;
    }

    // HR, TL, Owner can see all tasks
    const tasks = await Task.find(query)
      .populate("assignee", "firstName lastName email role")
      .populate("createdBy", "firstName lastName email role")
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
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Deleted succesfully ",
    });
  } catch (err) {
    return res.status(404).json({
      message: "Error Occurred",
      error: err.message,
    });
    console.log(err);
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // ✅ Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ Validate assignee if updated
    if (updates.assignee) {
      const assigneeUser = await User.findById(updates.assignee);
      if (!assigneeUser) {
        return res.status(404).json({ message: "Assignee not found" });
      }
    }

    // ✅ Validate assigner if updated
    if (updates.assigner) {
      const assignerUser = await User.findById(updates.assigner);
      if (!assignerUser) {
        return res.status(404).json({ message: "Assigner not found" });
      }
    }

    // ✅ Update task
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true, // return updated document
      runValidators: true, // enforce schema rules
    });

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
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
    const updatedUser = await userModel
      .findByIdAndUpdate(
        to,
        { $addToSet: { Tasks: taskId } }, // prevents duplicates
        { new: true } // return updated user
      )
      .populate("Tasks", "title description priority due_date status");

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
