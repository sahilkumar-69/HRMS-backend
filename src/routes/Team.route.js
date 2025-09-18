import { Router } from "express";
import {
  addMembers,
  createTeam,
  deleteTeam,
  getAllTeams,
  getJoinedTeams,
  getTeamsById,
  removeMembers,
} from "../controllers/Team.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const TeamRoute = Router();

TeamRoute.post("/create-team", authMiddleware, createTeam);

TeamRoute.get("/get-teams",getAllTeams); // get all teams

TeamRoute.get("/:id",authMiddleware, getTeamsById);

TeamRoute.patch("/:teamId/remove-members",authMiddleware, removeMembers); // add member in team

TeamRoute.patch("/:teamId/add-members",authMiddleware, addMembers); // add member in team

TeamRoute.get("/joined-by/:id",authMiddleware,getJoinedTeams); // get teams joined by user

TeamRoute.delete("/delete/:teamId",authMiddleware,deleteTeam); // get teams joined by user


export { TeamRoute };
