import { Router } from "express";
import {
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
  updateTicketStatus,
} from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createTicket);

router.get("/", authMiddleware, getTickets);

router.delete("/:id", authMiddleware, deleteTicket);

router.patch("/:id", authMiddleware, updateTicketStatus);

export { router as TicketRoutes };
