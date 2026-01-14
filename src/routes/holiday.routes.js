import { Router } from "express";
import {
  addHoliday,
  deleteHoliday,
  getHolidayById,
  getHolidays,
  updateHoliday,
  deleteAllHolidays,
} from "../controllers/holiday.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
export const holidayRouter = Router();

holidayRouter.route("/").get(getHolidays).post(upload.none(), addHoliday);
//   .delete(deleteAllHolidays);

holidayRouter
  .route("/:id")
  .delete(deleteHoliday)
  .get(getHolidayById)
  .patch(upload.none(), updateHoliday);
