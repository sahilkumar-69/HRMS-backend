import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addPolicy,
  updatePolicy,
  getPolicy,
} from "../controllers/policy.controller.js";

const policyRouter = express.Router();

policyRouter.post("/add-policy", authMiddleware, addPolicy);

policyRouter.patch("/update-policy", authMiddleware, updatePolicy);

policyRouter.get("/get-policy", getPolicy);

export { policyRouter as policyRoutes };
