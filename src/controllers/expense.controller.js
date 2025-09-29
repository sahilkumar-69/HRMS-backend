import { expense } from "../models/expense.model.js";
import { isValidObjectId } from "mongoose";
import { getIo } from "../utils/socketIO.js";

// CREATE a new expense
export const createExpense = async (req, res) => {
  const io = getIo();

  try {
    const { title, description, amount } = req.body;

    const { Role, FirstName, LastName } = req.user;

    if (!title.trim() || !description.trim() || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (Role !== "HR") {
      return res.json({
        message: "Only HR can add expenses",
        success: false,
      });
    }

    const newExpense = await expense.create({
      title,
      description,
      amount,
      createdBy: req.user._id,
    });

    // Emit to ADMIN room
    io.to("ADMIN").emit("expenseCreated", {
      expenseId: newExpense._id,
      title: newExpense.title,
      amount: newExpense.amount,
      createdBy: `${FirstName} ${LastName}`,
      createdAt: newExpense.createdAt,
      message: `New expense created by ${FirstName} ${LastName}`,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense: newExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateExpense = async (req, res) => {

const io = getIo();

  const { id } = req.params;
  const { title, description, amount } = req.body;

  const { Role, FirstName, LastName } = req.user;

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid expense ID" });
  }

  if (Role !== "HR") {
    return res.json({
      message: "Only HR can add expenses",
      success: false,
    });
  }

  try {
    const exp = await expense.findById(id);
    if (!exp)
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });

    // Only creator can update
    if (!exp.createdBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    exp.title = title || exp.title;
    exp.description = description || exp.description;
    exp.amount = amount || exp.amount;

    const updatedExpense = await exp.save();

    io.to("ADMIN").emit("expenseUpdated", {
      expenseId: updatedExpense._id,
      title: updatedExpense.title,
      amount: updatedExpense.amount,
      updatedBy: `${req.user.FirstName} ${req.user.LastName}`,
      updatedAt: updatedExpense.updatedAt,
      message: `Expense updated by ${req.user.FirstName} ${req.user.LastName}`,
    });

    return res.json({
      success: true,
      message: "Expense updated",
      expense: updatedExpense,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
    const io = getIo();
  const { id } = req.params;
  const { Role, FirstName, LastName } = req.user;

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid expense ID" });
  }

  if (Role !== "HR") {
    return res.json({
      message: "Only HR can add expenses",
      success: false,
    });
  }

  try {
    const exp = await expense.findById(id);
    if (!exp)
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });

    // Only creator can delete
    if (!exp.createdBy.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await expense.findByIdAndDelete(id);

    io.to("ADMIN").emit("expenseDeleted", {
      expenseId: id,
      deletedBy: `${FirstName} ${LastName}`,
      message: `Expense deleted by ${FirstName} ${LastName}`,
    });

    return res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET single expense
export const getExpenseById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid expense ID",
    });
  }

  try {
    const exp = await expense
      .findById(id)
      .populate("createdBy", "FirstName LastName Email");

    if (!exp) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      expense: exp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExpenses = async (req, res) => {
  const { Role } = req.user;

  if (Role) {
    return res.json({
      message: "Can't access",
      success: false,
    });
  }

  try {
    const expenses = await expense
      .find()
      .populate("createdBy", "FirstName LastName Role");

    return res.json({
      message: "Fetched all expense",
      success: true,
      expenses,
    });
  } catch (error) {
    return res.json({
      message: error.message,
      success: false,
    });
  }
};
