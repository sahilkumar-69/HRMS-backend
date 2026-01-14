import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasklist,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import { upload, uploadProfilePic } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const TaskRoutes = Router();

TaskRoutes.route("/get-tasks").get(getTasks);

TaskRoutes.route("/task-list").get(authMiddleware, getTasklist);

TaskRoutes.route("/get-task/:id").get(getTaskById);

TaskRoutes.route("/add-task").post(upload.array("docs"), createTask);

TaskRoutes.route("/update-task/:id").patch(updateTask);

TaskRoutes.route("/delete/:id").delete(deleteTask);

export { TaskRoutes };
