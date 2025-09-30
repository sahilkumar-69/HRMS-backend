// controllers/leaveController.js
import Leave from "../models/leave.model.js";
import { userModel } from "../models/User.model.js";
import { daysBetween } from "../utils/calculateDays.js";
import { isValidObjectId } from "mongoose";
import { sendNotification } from "../utils/sendNotification.js";

export const createLeave = async (req, res) => {
  try {
    const { leaveType, from, to, reason } = req.body;

    if (!leaveType || !from || !to || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    const days = daysBetween(from, to);

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      from,
      to,
      reason,
      status: "Pending",
      days,
    });

    await userModel.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { Leaves: leave._id } },
      { new: true }
    );

    //  Notify Admin & HR
    const recipients = await userModel.find(
      { Role: { $in: ["ADMIN", "HR"] } },
      "_id"
    );
    const recipientIds = recipients.map((u) => u._id.toString());

    await sendNotification({
      recipients: recipientIds,
      title: "New Leave Request",
      message: `${req.user.FirstName} ${req.user.LastName} applied for ${leaveType} leave.`,
      data: { leaveId: leave._id },
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

  if (!isValidObjectId(id)) {
    return res.json({
      message: "Invalid id",
      success: false,
    });
  }

  try {
    const leave = await Leave.findOneAndDelete({ _id: id }).populate(
      "employee",
      "FirstName LastName"
    );

    if (!leave) {
      return res.json({
        message: "Leave not found",
        success: false,
      });
    }

    await userModel.findOneAndUpdate(
      { _id: leave.employee._id },
      { $pull: { Leaves: leave._id } },
      { new: true }
    );

    //  Notify ADMIN & HR that a leave was cancelled
    const recipients = await userModel.find(
      { Role: { $in: ["ADMIN", "HR"] } },
      "_id"
    );
    const recipientIds = recipients.map((u) => u._id.toString());

    await sendNotification({
      recipients: recipientIds,
      title: "Leave Request Cancelled",
      message: `${leave.employee.FirstName} ${leave.employee.LastName} cancelled their ${leave.leaveType} leave request.`,
      data: { leaveId: leave._id },
    });

    return res.json({
      message: "Leave cancelled successfully",
      success: true,
    });
  } catch (error) {
    return res.json({
      message: error.message,
      success: false,
    });
  }
};
// ADMIN updates leave status (approve/reject)

export const updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const { Role, FirstName, LastName, _id: adminId } = req.user;

    if (Role !== "ADMIN") {
      return res.json({
        success: false,
        message: "Access denied",
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, updatedBy: adminId },
      { new: true }
    ).populate("employee", "FirstName LastName Email");

    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }

    //  Notify the employee about status change
    await sendNotification({
      recipients: leave.employee._id,
      title: "Leave Status Updated",
      message: `Your leave request has been ${status} by ${FirstName} ${LastName}.`,
      data: { leaveId: leave._id },
    });

    //  Notify all HRs about the update
    const hrUsers = await userModel.find({ Role: "HR" }, "_id");

    const hrIds = hrUsers.map((u) => u._id.toString());

    await sendNotification({
      recipients: hrIds,
      title: "Leave Status Updated",
      message: `${FirstName} ${LastName} has ${status} ${leave.employee.FirstName} ${leave.employee.LastName}'s leave request.`,
      data: { leaveId: leave._id },
    });

    return res.json({ success: true, message: "Leave updated", leave });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// export const takenLeaves = async (req, res) => {};
