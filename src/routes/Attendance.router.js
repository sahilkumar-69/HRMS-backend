import { Router } from "express";
import {
  allAttendance,
  checkIn,
  checkOut,
  getAttendance,
  updateAttendance,
} from "../controllers/Attendance.controller.js";

const AttendanceRouter = Router();

AttendanceRouter.route("/:userId").get(getAttendance);

AttendanceRouter.route("/").get(allAttendance);

AttendanceRouter.route("/checkin").post(checkIn);

AttendanceRouter.route("/update-attendance").patch(updateAttendance);

AttendanceRouter.route("/checkout").post(checkOut);

export default AttendanceRouter;
