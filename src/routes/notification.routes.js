import express from "express";
import {
  createNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
// import { authMiddleware } from "../middlewares/auth.js";

const notificationRoutes = express.Router();

notificationRoutes.post("/", authMiddleware, createNotification); // create new notification
notificationRoutes.get("/", authMiddleware, getMyNotifications); // get logged-in user's notifications
notificationRoutes.patch("/:id/read", authMiddleware, markAsRead); // mark as read
notificationRoutes.patch("/read", authMiddleware, markAllAsRead); // mark as read
notificationRoutes.delete("/:id", authMiddleware, deleteNotification); // delete

export default notificationRoutes;
