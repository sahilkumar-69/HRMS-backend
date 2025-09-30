import { expense } from "../models/expense.model.js";
import { isValidObjectId } from "mongoose";
import { sendNotification } from "../utils/sendNotification.js";

// CREATE a new expense
export const createExpense = async (req, res) => {
  try {
    const { title, description, amount } = req.body;
    const { Role, FirstName, LastName, _id: hrId } = req.user;

    if (
      !title?.toString().trim() ||
      !description?.toString().trim() ||
      !amount
    ) {
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
      createdBy: hrId,
    });

    //  Notify all ADMIN users
    const adminUsers = await userModel.find({ Role: "ADMIN" }, "_id");
    const adminIds = adminUsers.map((u) => u._id);

    await sendNotification({
      recipients: adminIds,
      title: "New Expense Created",
      message: `A new expense "${title}" of amount ${amount} was created by ${FirstName} ${LastName}.`,
      data: { expenseId: newExpense._id },
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
  const { id } = req.params;
  const { title, description, amount } = req.body;
  const { Role, FirstName, LastName, _id: hrId } = req.user;

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid expense ID" });
  }

  if (Role !== "HR") {
    return res.json({
      message: "Only HR can update expenses",
      success: false,
    });
  }

  try {
    const exp = await expense.findById(id);
    if (!exp) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    //  Ensure only creator can update
    if (!exp.createdBy.equals(hrId)) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update this expense",
      });
    }

    //  Update fields
    exp.title = title || exp.title;
    exp.description = description || exp.description;
    exp.amount = amount || exp.amount;

    const updatedExpense = await exp.save();

    // 🔔 Notify all ADMIN users
    const adminUsers = await userModel.find({ Role: "ADMIN" }, "_id");
    const adminIds = adminUsers.map((u) => u._id);

    await sendNotification({
      recipients: adminIds,
      title: "Expense Updated",
      message: `Expense "${updatedExpense.title}" was updated by ${FirstName} ${LastName}.`,
      data: { expenseId: updatedExpense._id },
    });

    return res.json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const { Role, FirstName, LastName, _id: hrId } = req.user;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid expense ID",
    });
  }

  if (Role !== "HR") {
    return res.json({
      success: false,
      message: "Only HR can delete expenses",
    });
  }

  try {
    const exp = await expense.findById(id);
    if (!exp) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    //  Only the creator can delete
    if (!exp.createdBy.equals(hrId)) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this expense",
      });
    }

    await expense.findByIdAndDelete(id);

    //  Notify all ADMIN users
    const adminUsers = await userModel.find({ Role: "ADMIN" }, "_id");
    const adminIds = adminUsers.map((u) => u._id);

    await sendNotification({
      recipients: adminIds,
      title: "Expense Deleted",
      message: `Expense "${exp.title}" was deleted by ${FirstName} ${LastName}.`,
      data: { expenseId: id },
    });

    return res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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

  if (Role !== "HR" && Role !== "ADMIN") {
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
