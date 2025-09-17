import { Router } from "express";
import { createLeave, getAllLeaves, updateLeaveStatus } from "../controllers/Leave.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/apply-leave").post(authMiddleware, createLeave);

router.route("/all-requests").get(authMiddleware, getAllLeaves);

router.route("/:id").get(authMiddleware, getAllLeaves);

router.route("/taken-by/:userId").get(authMiddleware, getAllLeaves);

router
  .route("/update-request-status/:leaveId")
  .post(authMiddleware, updateLeaveStatus);

export default router;