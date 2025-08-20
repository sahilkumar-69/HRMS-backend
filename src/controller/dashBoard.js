// controllers/taskController.js
import Task from "../models/task.js";
import Team from "../models/team.js";
import { userModel as User } from "../models/User.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
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

    // ✅ Validate required fields
    if (!title || !dueDate || !assignee || !assigner) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate assignee exists
    const assigneeUser = await User.findById(assignee);
    if (!assigneeUser) {
      return res.status(404).json({ message: "Assignee not found" });
    }

    // ✅ Validate assigner exists
    const assignerUser = await User.findById(assigner);
    if (!assignerUser) {
      return res.status(404).json({ message: "Assigner not found" });
    }

    let docs = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(
        async (file) => await uploadOnCloudinary(file)
      );

      docs = await uploadPromises.secure_url;
    }

    // ✅ Create Task
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignee,
      assigner,
      status,
      docs,
      createdBy: req.user._id, // from JWT middleware
    });

    const createdTask = await task.save();

    await assignTask(createdTask._id, assignee);

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
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

// Create a new team
const createTeam = async (req, res) => {
  try {
    const { name, description, lead, members } = req.body;

    // Validate lead exists
    const leadUser = await User.findById(lead);
    if (!leadUser || leadUser.role !== "tl") {
      return res.status(400).json({ message: "Invalid team lead" });
    }

    const team = new Team({
      name,
      description,
      lead,
      members,
      createdBy: req.user.id, // HR or Owner
    });

    await team.save();
    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating team", error: error.message });
  }
};

// Get teams (with members)
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("lead", "firstName lastName email role")
      .populate("members", "firstName lastName email role");

    res.json(teams);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching teams", error: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // assuming auth middleware attaches user info (id, role)

    let query = { _id: id };

    // 🔒 Restrict Employees & TLs to only their teams
    if (user.Role === "EMPLOYEE" || user.Role === "TL") {
      query = {
        _id: id,
        $or: [
          { lead: user._id }, // if TL is the lead
          { members: user._id }, // if Employee is a member
        ],
      };
    }

    const team = await Team.findOne(query)
      .populate("lead", "FirstName LastName Email Role")
      .populate("members", "FirstName LastName Email Role");

    if (!team) {
      return res
        .status(404)
        .json({ message: "Team not found or access denied" });
    }

    res.json(team);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching team", error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ✅ validate lead
    if (updates.lead) {
      const leadExists = await userModel.findById(updates.lead);
      if (!leadExists) {
        return res.status(400).json({ message: "Invalid lead userId" });
      }
    }

    // ✅ validate members
    if (updates.members && updates.members.length > 0) {
      const membersExist = await userModel.find({
        _id: { $in: updates.members },
      });
      if (membersExist.length !== updates.members.length) {
        return res.status(400).json({ message: "Some members not found" });
      }
    }

    // ✅ merge updates instead of replace
    Object.assign(team, updates);
    await team.save();

    team = await Team.findById(id)
      .populate("lead", "FirstName LastName Role Email")
      .populate("members", "FirstName LastName Role Email");

    res.json({ message: "Team updated successfully", team });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating team", error: error.message });
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

export {
  createTask,
  getTasks,
  deleteTasks,
  createTeam,
  getTeams,
  updateTask,
  getEmployeeTasks,
  updateTeam,
  getTeamById,
};