// routes/attendance.js
import { Types } from "mongoose";
import Attendance from "../models/Attendance.model.js";
import { userModel } from "../models/User.js";
// import AttendanceModel from "../models/Attendance.model.js";

// Check-in
const checkIn = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // check if user exists
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check if already checked in today
    const existing = await Attendance.findOne({
      user: userId,
      date: today,
    });

    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const record = new Attendance({
      user: userId,
      date: today,
      checkIn: new Date(),
      status,
    });

    await record.save();
    res.json({ message: "Check-in successful", record });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      .populate("user", "name email role")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { userId, date, status } = req.body;

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

export { checkIn, checkOut, getAttendance, updateAttendance };
