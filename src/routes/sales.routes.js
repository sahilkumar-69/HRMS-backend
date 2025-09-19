import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
addSale,getSales
} from "../controllers/sales.controller.js";
import { upload } from "../middleware/upload.js";

export const salesRouter = express.Router();

salesRouter.post("/", authMiddleware,upload.array("docs"), addSale);

salesRouter.get("/", authMiddleware, getSales);

// salesRouter.get("/get-policy", authMiddleware, getPolicy);
