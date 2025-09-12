import express from "express";
import {
  addDailyUpdate,
  getTaskUpdates,
} from "../controllers/dailyTaskUpdate.controller.js";
import { upload } from "../middleware/upload.js";

const dailyUpdateRoutes = express.Router();

dailyUpdateRoutes.post("/daily-update", upload.single("img"), addDailyUpdate); // Create daily update
dailyUpdateRoutes.get("/task-updates", getTaskUpdates); // Get all updates (with optional filters)

export default dailyUpdateRoutes;
