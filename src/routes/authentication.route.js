import { Router } from "express";
import { userLogin } from "../controller/authentication.controller";

const Route = Router();

Route.route("/login").post(userLogin);
