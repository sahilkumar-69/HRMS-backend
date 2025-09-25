import { Router } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
} from "../controllers/payment.controller.js";

const paymentRoutes = Router();

// HR creates salary record
paymentRoutes.post("/", createPayment);

// HR & Admin view
paymentRoutes.get("/", getAllPayments);

paymentRoutes.get("/:id", getPaymentById);

// HR updates before approval
paymentRoutes.put("/:id", updatePayment);

// Admin updates status
paymentRoutes.patch("/:id/status", updatePaymentStatus);

// optional delete
paymentRoutes.delete("/:id", deletePayment);

export { paymentRoutes };
