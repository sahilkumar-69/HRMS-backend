import express from "express";
import {
  addDailyUpdate,
  getTaskUpdates,
} from "../controllers/dailyTaskUpdate.controller.js";
import { upload } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const dailyUpdateRoutes = express.Router();

dailyUpdateRoutes.post("/",authMiddleware,upload.single("img"),addDailyUpdate); // Create dailby update

dailyUpdateRoutes.get("/task-updates", getTaskUpdates); // Get all updates (with optional filters)

export default dailyUpdateRoutes;
