// controllers/leaveController.js
import Leave from "../models/leave.model.js";
import { userModel } from "../models/User.model.js";
import { daysBetween } from "../utils/calculateDays.js";
import { isValidObjectId } from "mongoose";
import { getIo } from "../utils/socketIO.js";

// Employee applies for leave
export const createLeave = async (req, res) => {
  const io = getIo();

  try {
    const { leaveType, from, to, reason } = req.body;

    // console.log(req.body);
    // console.log(req.user);

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

    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { Leaves: leave._id },
      },
      {
        new: true,
      }
    );

    io.to(["ADMIN", "HR"]).emit("leaveApplied", {
      employeeName: `${req.user.FirstName} ${req.user.LastName}`,
      leaveType,
      leave,
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

export const cancelRequest = async (req, res) => {
  const { id } = req.params;
  const io = getIo();

  if (!isValidObjectId(id)) {
    return res.json({
      message: "Invalid id",
      success: false,
    });
  }
  try {
    const leave = await Leave.findOneAndDelete({ _id: id });

    if (!leave) {
      return res.json({
        message: "Leave not found",
        success: false,
      });
    }

    await userModel.findOneAndUpdate(
      { _id: leave.employee },
      {
        $pull: {
          Leaves: leave._id,
        },
      },
      {
        new: true,
      }
    );

    return res.json({
      message: "Leave cancelled successfully",
      success: true,
    });
  } catch (error) {
    res.json({
      message: error.message,
      success: false,
    });
  }
};
// ADMIN updates leave status (approve/reject)
export const updateLeaveStatus = async (req, res) => {
  const io = getIo();

  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const { Role, FirstName, LastName } = req.user;

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

    // Notify the employee
    io.to(leave.employee._id.toString()).emit("leaveUpdate", {
      leaveId: leave._id,
      status: leave.status,
      message: `Your leave request has been ${leave.status} by ${FirstName} ${LastName}`,
    });

    // Notify HRs
    io.to("HR").emit("leaveUpdate", {
      leaveId: leave._id,
      status: leave.status,
      message: `${FirstName} ${LastName} has ${leave.status} ${leave.employee.FirstName} ${leave.employee.LastName}'s leave request`,
    });

    return res.json({ success: true, message: "Leave updated", leave });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// export const takenLeaves = async (req, res) => {};
