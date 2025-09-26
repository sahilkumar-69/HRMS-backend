import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addPolicy,
  updatePolicy,
  getPolicy,
  deletePolicy,
} from "../controllers/policy.controller.js";
import { upload } from "../middleware/upload.js";

const policyRouter = express.Router();

policyRouter.post(
  "/add-policy",
  upload.single("pdfUrl"),
  authMiddleware,
  addPolicy
);

policyRouter.put(
  "/update-policy",
  upload.single("pdfUrl"),
  authMiddleware,
  updatePolicy
);

policyRouter.get("/get-policy", getPolicy);

policyRouter.delete("/delete-policy/:id", authMiddleware, deletePolicy);

export { policyRouter as policyRoutes };
