import { Router } from "express";
import { createLeave, getAllLeaves } from "../controllers/Leave.controller.js";
import { findUser } from "../middleware/findUser.js";

const router = Router();

router.route("/apply-leave").post(findUser, createLeave);

router.route("/leave-requests").get(getAllLeaves);

export default router;
