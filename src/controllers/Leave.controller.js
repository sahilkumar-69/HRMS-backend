// controllers/leaveController.js
import Leave from "../models/leave.model.js";
import { userModel } from "../models/User.model.js";
import { daysBetween } from "../utils/calculateDays.js";
import { isValidObjectId } from "mongoose";

// Employee applies for leave
export const createLeave = async (req, res) => {
  try {
    const { leaveType, from, to, reason } = req.body;

    console.log(req.body);
    console.log(req.user);

    if (!leaveType || !from || !to || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    let days = daysBetween(from, to);

    const leave = await Leave.create({
      employee: req.user._id, // taken from auth middleware
      leaveType,
      from,
      to,
      reason,
      status: "Pending",
      days,
    });

    await userModel.findByIdAndUpdate(req.user._id, {
      $addToSet: { Leaves: leave._id },
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// HR/Admin fetches all leave requests
export const getAllLeaves = async (req, res) => {
  try {
    const { Role, _id } = req.user;

    let leaves;

    if (Role === "HR" || Role === "ADMIN") {
      leaves = await Leave.find()
        .populate("employee", "FirstName LastName Email Department")
        .sort({ createdAt: -1 });
    } else {
      leaves = await Leave.find({ employee: _id })
        .populate("employee", "FirstName LastName Email Department")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched",
      leaves,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserLeaves = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid user id" });
    }

    const user = await userModel
      .findById(userId)
      .select("Leaves")
      .sort({ createdAt: -1 });
  } catch (error) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// HR updates leave status (approve/reject)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const { Role } = req.user;

    if (Role !== "ADMIN") {
      return res.json({
        success: false,
        message: "Access denied",
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, updatedBy: req.user._id },
      { new: true }
    ).populate("employee", "FirstName LastName Email");

    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    return res.json({ success: true, message: "Leave updated", leave });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const takenLeaves = async (req, res) => {};
