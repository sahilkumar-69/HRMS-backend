import { Router } from "express";
import {
 
  addMembers,
  createTeam,
  getAllTeams,
  getJoinedTeams,
  getTeamsById,
  removeMember,
} from "../controllers/Team.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const TeamRoute = Router();

TeamRoute.route("/create-team").post(authMiddleware, createTeam);

TeamRoute.route("/get-teams").get(getAllTeams); // get all teams

TeamRoute.route("/:id").get(authMiddleware, getTeamsById);

TeamRoute.route("/:teamId/remove-members").patch(authMiddleware, removeMember); // add member in team

TeamRoute.route("/:teamId/add-members").patch(authMiddleware, addMembers); // add member in team

TeamRoute.route("/joined-by/:id").get(getJoinedTeams); // get teams joined by user

export { TeamRoute };
