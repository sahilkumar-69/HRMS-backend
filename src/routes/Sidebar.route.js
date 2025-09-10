// routes/sidebarRoutes.js
import express from "express";
import {
  createSidebar,
  getAllSidebars,
  getSidebarById,
  updateSidebar,
  deleteSidebar,
} from "../controller/sidebar.controller.js";

const SidebarRouter = express.Router();

// Create a new sidebar
SidebarRouter.post("/", createSidebar);

// Get all sidebars
SidebarRouter.get("/", getAllSidebars);

// Get a single sidebar by ID
SidebarRouter.get("/:id", getSidebarById);

// Update a sidebar by ID
SidebarRouter.put("/:id", updateSidebar);

// Delete a sidebar by ID
SidebarRouter.delete("/:id", deleteSidebar);

export default SidebarRouter;
