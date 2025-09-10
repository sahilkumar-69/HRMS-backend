import { Router } from "express";
import { createLeave, getAllLeaves } from "../controller/Leave.controller.js";
import { findUser } from "../middleware/findUser.js";

const router = Router();

router.route("/apply-leave").post(findUser, createLeave);

router.route("/leave-requests").post(getAllLeaves);

export default router;
