import { Router } from "express";
import {
  deleteUser,
  getUserById,
  updateUser,
  userLogin,
  userSignUp,
} from "../controller/authentication.js";
import { findUser } from "../middleware/findUser.js";

const Route = Router();

Route.route("/login").post(userLogin);
Route.route("/signup").post(userSignUp);
Route.route("/update-user/:id").patch(findUser, updateUser);
Route.route("/delete-user").delete(deleteUser);
Route.route("/user/:id").get(getUserById);

export { Route };
