import { Router } from "express";

import {
  createTask,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import { upload, uploadProfilePic } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const TaskRoutes = Router();

TaskRoutes.route("/get-tasks").get(getTasks);

TaskRoutes.route("/add-task").post(upload.array("docs"), createTask);

TaskRoutes.route("/update-task").patch(updateTask);

export { TaskRoutes };
