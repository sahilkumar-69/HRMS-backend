// controllers/taskController.js
import Task from "../models/Task.js";
import { userModel as User } from "../models/User.js";

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignee } = req.body;

    // Validate assignee exists
    const user = await User.findById(assignee);
    if (!user) {
      return res.status(404).json({ message: "Assignee not found" });
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignee,
      createdBy: req.user.id, // from JWT
    });

    await task.save();

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating task", error: error.message });
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
// controllers/teamController.js
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

const updateTask = async (req, res) => {};

export { createTask, getTasks, deleteTasks, createTeam, getTeams, updateTask };
// HR/Owner updates employee details
