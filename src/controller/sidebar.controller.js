// controllers/sidebarController.js
import Sidebar from "../models/SideBarRoutes.model.js";
// Create a new sidebar with routes
export const createSidebar = async (req, res) => {
  try {
    const sidebar = new Sidebar(req.body);
    const savedSidebar = await sidebar.save();
    res.status(201).json(savedSidebar);
  } catch (error) {
    res.status(400).json({ message: "Error creating sidebar", error });
  }
};

// Get all sidebars
export const getAllSidebars = async (req, res) => {
  try {
    const sidebars = await Sidebar.find();
    res.status(200).json(sidebars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sidebars", error });
  }
};

// Get a single sidebar by ID
export const getSidebarById = async (req, res) => {
  try {
    const sidebar = await Sidebar.findById(req.params.id);
    if (!sidebar) {
      return res.status(404).json({ message: "Sidebar not found" });
    }
    res.status(200).json(sidebar);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sidebar", error });
  }
};

// Update sidebar by ID
export const updateSidebar = async (req, res) => {
  try {
    const updatedSidebar = await Sidebar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSidebar) {
      return res.status(404).json({ message: "Sidebar not found" });
    }
    res.status(200).json(updatedSidebar);
  } catch (error) {
    res.status(400).json({ message: "Error updating sidebar", error });
  }
};

// Delete sidebar by ID
export const deleteSidebar = async (req, res) => {
  try {
    const deletedSidebar = await Sidebar.findByIdAndDelete(req.params.id);
    if (!deletedSidebar) {
      return res.status(404).json({ message: "Sidebar not found" });
    }
    res.status(200).json({ message: "Sidebar deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sidebar", error });
  }
};
