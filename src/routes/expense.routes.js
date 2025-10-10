import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // assuming you have auth

const expenseRoutes = express.Router();

// All routes require authentication
expenseRoutes.use(authMiddleware);

// Create a new expense
expenseRoutes.post("/", createExpense);

// Get all expenses (optionally filter by mine=true)
expenseRoutes.get("/", getExpenses);

// Get single expense by ID
expenseRoutes.get("/:id", getExpenseById);

// Update an expense by ID
expenseRoutes.patch("/:id", updateExpense);

// Delete an expense by ID
expenseRoutes.delete("/:id", deleteExpense);

export default expenseRoutes;
