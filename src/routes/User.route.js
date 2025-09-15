import { Router } from "express";
import {
  deleteUser,
  getAllEmp,
  getUserById,
  updateUser,
  userLogin,
  userSignUp,
} from "../controllers/authentication.js";

import { upload, uploadProfilePic } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const Route = Router();

// USER RELATED ROUTES

Route.route("/login").post(userLogin);

Route.route("/add-employee").post(
  uploadProfilePic.single("Profile"),
  userSignUp
);

Route.route("/update-user/:id").patch(authMiddleware, updateUser);

Route.route("/delete-user").delete(deleteUser);

Route.route("/user/:id").get(getUserById);

Route.route("/user").get( getAllEmp);
 
export { Route };
