import { Router } from "express";

import {
  getOtp,
  verifyOtpController,
} from "../../controllers/Otp.controller.js";

const OtpRoutes = Router();

OtpRoutes.route("/get-otp").post(getOtp);

OtpRoutes.route("/verify-otp").post(verifyOtpController);

export { OtpRoutes };
