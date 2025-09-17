import { Router } from "express";
import { createLeave, getAllLeaves, updateLeaveStatus } from "../controllers/Leave.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/apply-leave").post(authMiddleware, createLeave);

router.route("/all-requests").get(getAllLeaves);

router
  .route("/update-request-status/:leaveId")
  .post(authMiddleware, updateLeaveStatus);

export default router;