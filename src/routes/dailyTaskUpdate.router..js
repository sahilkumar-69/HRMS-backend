import express from "express";
import {
  addDailyUpdate,
  deleteUpdate,
  getDailyTaskUpdates,
} from "../controllers/dailyTaskUpdate.controller.js";
import { upload } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const dailyUpdateRoutes = express.Router();

dailyUpdateRoutes.post(
  "/",
  authMiddleware,
  upload.single("img"),
  addDailyUpdate
); // Create dailby update

dailyUpdateRoutes.get("/", authMiddleware, getDailyTaskUpdates); // Get all updates (with optional filters)

dailyUpdateRoutes.delete("/:id", authMiddleware, deleteUpdate); // delete updates  

export default dailyUpdateRoutes;
