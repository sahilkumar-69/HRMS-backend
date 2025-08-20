import { Router } from "express";
import {
  deleteUser,
  getUserById,
  updateUser,
  userLogin,
  userSignUp,
} from "../controller/authentication.js";

import {
  createTask,
  createTeam,
  getTasks,
  getTeamById,
  getTeams,
  updateTask,
} from "../controller/dashBoard.js";
import { upload, uploadProfilePic } from "../middleware/upload.js";
import { findUser } from "../middleware/findUser.js";

const Route = Router();

// USER RELATED ROUTES

Route.route("/login").post(userLogin);

Route.route("/signup").post(uploadProfilePic.single("profile"), userSignUp);

Route.route("/update-user/:id").patch(findUser, updateUser);

Route.route("/delete-user").delete(deleteUser);

Route.route("/user/:id").get(getUserById);

// TASK RELATED ROUTES

Route.route("/get-tasks").post(getTasks);

Route.route("/add-task").post(upload.array("docs", 5), createTask);

Route.route("/update-task").patch(updateTask);

// TEAM RELATED ROUTES

Route.route("/create-team").post(createTeam);

Route.route("/get-team").get(getTeams);

Route.route("/team/:id").get(findUser, getTeamById);

export { Route };
