import { Router } from "express";
import { createLeave, getAllLeaves } from "../controllers/Leave.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/apply-leave").post(authMiddleware, createLeave);

router.route("/leave-requests").get(getAllLeaves);

export default router;
