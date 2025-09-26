import { Router } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const paymentRoutes = Router();

// HR creates salary record
paymentRoutes.post("/", authMiddleware, createPayment);

// HR & Admin view
paymentRoutes.get("/", authMiddleware, getAllPayments);


paymentRoutes.get("/:id", authMiddleware, getPaymentById);

// HR updates before approval
paymentRoutes.put("/:id", authMiddleware, updatePayment);

// Admin updates status
paymentRoutes.patch("/:id/status", authMiddleware, updatePaymentStatus);

// optional delete
paymentRoutes.delete("/:id", authMiddleware, deletePayment);

export { paymentRoutes };
