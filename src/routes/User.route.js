import { Router } from "express";
import {
  checkAuth,
  deletePaySlip,
  deleteUser,
  forgotPassword,
  generatePayslip,
  getAllEmp,
  getPaySlip,
  getUserById,
  updatePaySlip,
  updateUser,
  userLogin,
  userSignUp,
} from "../controllers/authentication.js";

import { upload, uploadProfilePic } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const Route = Router();

// USER RELATED ROUTES
// console.log(__filename)

Route.route("/checkAuth").get(authMiddleware,checkAuth);

Route.route("/login").post(userLogin);

Route.route("/add-employee").post(
  // authMiddleware,
  uploadProfilePic.single("Profile"),
  userSignUp
);

Route.route("/forgotpassword").post(forgotPassword);

Route.route("/update-user/:id").patch(authMiddleware, updateUser);

Route.route("/delete-user/:id").delete(deleteUser);

Route.route("/user/:id").get(getUserById);

Route.route("/user").get(getAllEmp);

Route.route("/generate").post(authMiddleware, generatePayslip);

Route.route("/getAllSlips").get(authMiddleware, getPaySlip);

Route.route("/update-slip").put(authMiddleware, updatePaySlip);

Route.route("/delete-slip").delete(authMiddleware, deletePaySlip);

export { Route };
