import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addPolicy,
  updatePolicy,
  getPolicy,
} from "../controllers/policy.controller.js";
import { upload } from "../middleware/upload.js";

const policyRouter = express.Router();

policyRouter.post("/add-policy", upload.none(), authMiddleware, addPolicy);

policyRouter.patch(
  "/update-policy",
  upload.none(),
  authMiddleware,
  updatePolicy
);

policyRouter.get("/get-policy", getPolicy);

export { policyRouter as policyRoutes };
