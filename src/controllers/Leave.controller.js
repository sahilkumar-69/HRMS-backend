// controllers/leaveController.js
import Leave from "../models/leave.model.js";

// Employee applies for leave
export const createLeave = async (req, res) => {
  try {
    const { leaveType, from, to, reason } = req.body;

    if (!leaveType || !from || !to || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    const leave = await Leave.create({
      employee: req.user._id, // taken from auth middleware
      leaveType,
      from,
      to,
      reason,
      status: "Pending",
      createdBy: req.user._id,
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
    const leaves = await Leave.find()
      .populate("employee", "FirstName LastName Email Department")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaves });
  } catch (err) {
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
