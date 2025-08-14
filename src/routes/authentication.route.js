import { Router } from "express";

const Route = Router();

Route.route("/login").post(userLogin);
