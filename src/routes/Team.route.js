import { Router } from "express";
import {
  createTeam,
  getTeamById,
  getTeams,
} from "../controllers/Team.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const TeamRoute = Router();

TeamRoute.route("/create-team").post(createTeam);

TeamRoute.route("/get-team").get(getTeams);

TeamRoute.route("/:id").get(authMiddleware, getTeamById);

export { TeamRoute };
