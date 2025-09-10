import { Router } from "express";

import {
  createTask,
  getTasks,
  updateTask,
} from "../controller/task.controller.js";
import { upload, uploadProfilePic } from "../middleware/upload.js";
import { findUser } from "../middleware/findUser.js";

const TaskRoutes = Router();

TaskRoutes.route("/get-tasks").get(findUser, getTasks);

TaskRoutes.route("/add-task").post(upload.array("docs"), createTask);

TaskRoutes.route("/update-task").patch(updateTask);

export { TaskRoutes };
