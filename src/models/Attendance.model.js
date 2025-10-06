// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkInDate: { type: String },
  checkInTime: { type: String },
  checkOut: { type: Date },
  status: {
    type: String,
    enum: ["Present", "Absent", "Leave", "Half-Day"],
    default: "Present",
  },
  workingHours: { type: Number, default: 0 },
});

export default mongoose.model("Attendance", attendanceSchema);
