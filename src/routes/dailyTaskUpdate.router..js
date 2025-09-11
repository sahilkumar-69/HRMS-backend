import express from "express";
import {
  createTaskUpdate,
  getTaskUpdates,
} from "../controller/dailyTaskUpdate.controller.js";
import { uploadProfilePic } from "../middleware/upload.js";

const dailyUpdateRoutes = express.Router();

dailyUpdateRoutes.post(
  "/task-updates",
  uploadProfilePic.single("file"),
  createTaskUpdate
); // Create daily update
dailyUpdateRoutes.get("/task-updates", getTaskUpdates); // Get all updates (with optional filters)

export default dailyUpdateRoutes;
