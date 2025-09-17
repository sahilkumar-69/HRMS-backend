import { Router } from "express";
import { createLeave, getAllLeaves, updateLeaveStatus } from "../controllers/Leave.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/apply-leave", authMiddleware, createLeave);

router.get("/all-requests", authMiddleware, getAllLeaves);

router.get("/:id", authMiddleware, getAllLeaves);

router.get("/taken-by/:userId", authMiddleware, getAllLeaves);

router.patch(
  "/update-request-status/:leaveId",
  authMiddleware,
  updateLeaveStatus
);

export default router;