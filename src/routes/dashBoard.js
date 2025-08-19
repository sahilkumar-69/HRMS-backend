import { Router } from "express";
import {
  createTask,
  createTeam,
  getTasks,
  getTeams,
  updateTask,
} from "../controller/dashBoard.js";

const Route = Router();

Route.route("/get-tasks").post(getTasks);

Route.route("/add-task").post(createTask);

Route.route("/update-task").patch(updateTask);

Route.post("/create-team", createTeam);

Route.get("/get-team", getTeams);

export default Route;
