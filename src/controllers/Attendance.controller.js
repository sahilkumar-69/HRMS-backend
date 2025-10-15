// routes/attendance.js
import { Types } from "mongoose";
import Attendance from "../models/Attendance.model.js";
import { userModel } from "../models/User.model.js";
import { sendNotification } from "../utils/sendNotification.js";
// import AttendanceModel from "../models/Attendance.model.js";

// Check-in
const checkIn = async (req, res) => {
  try {
    const { userId, date, time, status } = req.body;

    // If date and time not provided, use current date & time
    const now = new Date();
    const today = date || now.toISOString().split("T")[0];
    const checkInTime = time || now.toTimeString().slice(0, 5); // "HH:MM"

    //  Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //  Check if already checked in today
    const existing = await Attendance.findOne({ user: userId, date: today });
    if (existing) {
      return res
        .status(200)
        .json({ success: false, message: "Already checked in today" });
    }

    //  Create attendance record
    const record = new Attendance({
      user: userId,
      date: today, // YYYY-MM-DD
      checkIn: now, // Full Date object (for exact timestamp)
      checkInDate: today, // string (YYYY-MM-DD)
      checkInTime: checkInTime, // string (HH:MM)
      status,
    });

    await record.save();

    // await userModel.findByIdAndUpdate(userId)

    //  Notify user
    await sendNotification({
      recipients: userId.toString(),
      title: `You Checked-In at ${checkInTime}`,
      message: `${user.FirstName} ${user.LastName} checked in on ${today} with status: ${status}.`,
      data: { attendanceId: record._id, userId: user._id },
    });

    res.status(201).json({
      success: true,
      message: "Check-in successful",
      record,
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Checkout
const checkOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({ user: userId, date: today });
    if (!record) return res.status(404).json({ message: "No check-in found" });

    record.checkOut = new Date();
    record.workingHours = (record.checkOut - record.checkIn) / (1000 * 60 * 60); // in hours

    await record.save();
    res.json({ message: "Check-out successful", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance for one user
const getAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await Attendance.find({ user: userId })
      .populate("user", "FirstName LastName Email Role")
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { userId, date, time, status } = req.body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "User is not found or invalids",
        success: false,
      });
    }

    const UpdatedAttendance = await Attendance.findOneAndUpdate(
      {
        user: userId,
        date,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    console.log("attendanceToUpdate", UpdatedAttendance);

    if (!UpdatedAttendance) {
      return res.status(400).json({
        message: "Attendance not found for this date",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Updated",
      success: true,
      UpdatedAttendance,
    });
  } catch (error) {
    return res.status(500).json({
      error,
      message: error.message,
      success: false,
    });
  }
};

const allAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "FirstName LastName Email Role")
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, records });
    // console.log(records);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { checkIn, checkOut, getAttendance, allAttendance, updateAttendance };
