import TaskUpdate from "../models/dailyTaskUpdate.model.js";

// Create a new daily task update
export const createTaskUpdate = async (req, res) => {
  try {
    const { title, description, img, name, role } = req.body;

    const newUpdate = new TaskUpdate({
      title,
      description,
      img,
      name,
      role,
    });

    await newUpdate.save();

    res.status(201).json({
      success: true,
      message: "Task update created successfully",
      data: newUpdate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all updates (optional: filter by role or name)
export const getTaskUpdates = async (req, res) => {
  try {
    const { role, name } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (name) filter.name = name;

    const updates = await TaskUpdate.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
