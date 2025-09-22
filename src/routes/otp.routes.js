import express from "express";
import { updatePassword, verifyOtp } from "../controllers/authentication.js";

const otpRouter = express.Router();

otpRouter.route("/verify-otp").get(verifyOtp);

otpRouter.route("/update-password").post(updatePassword);

export default otpRouter;
