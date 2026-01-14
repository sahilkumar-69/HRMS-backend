import { Router } from "express";
import {
  addMembers,
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamsById,
  removeMembers,
  updateTeam,
} from "../controllers/Team.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const TeamRoute = Router();

TeamRoute.post("/", authMiddleware, createTeam);

TeamRoute.get("/get-teams", authMiddleware, getAllTeams); // get all teams

TeamRoute.get("/:id", authMiddleware, getTeamsById);

TeamRoute.put("/:id", authMiddleware, updateTeam);

TeamRoute.patch("/remove/:teamId", authMiddleware, removeMembers); // add member in team

TeamRoute.patch("/add/:teamId", authMiddleware, addMembers); // add member in team

TeamRoute.delete("/:teamId", authMiddleware, deleteTeam); // get teams joined by user

export { TeamRoute };
