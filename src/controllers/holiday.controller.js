import Holiday from "../models/holiday.model.js";
import { isValidObjectId } from "mongoose";

const addHoliday = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const { Role } = req.user;

    if (Role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }

    const newHoliday = new Holiday({
      title,
      date,
      description,
    });

    await newHoliday.save();
    return res
      .status(201)
      .json({ message: "Holiday added successfully", holiday: newHoliday });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, success: false, error: error });
  }
};

const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json({ success: true, data: holidays });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
      error: error,
    });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { Role } = req.user;

    if (Role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }
    const deletedHoliday = await Holiday.findByIdAndDelete(id);
    if (!deletedHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting holiday", error: error.message });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { Role } = req.user;

    if (Role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { title, date, description } = req.body;
    const updatedHoliday = await Holiday.findByIdAndUpdate(
      id,
      { title, date, description },
      { new: true }
    );

    if (!updatedHoliday) {
      return res
        .status(404)
        .json({ success: false, message: "Holiday not found" });
    }

    res.status(200).json({
      message: "Holiday updated successfully",
      success: true,
      data: updatedHoliday,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, success: false, error: error });
  }
};

const getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ message: "A valid holiday id is required", success: false });
    }

    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res
        .status(404)
        .json({ message: "Holiday not found", success: false });
    }
    res
      .status(200)
      .json({ message: "Holiday fetched", success: true, data: holiday });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message, success: false, error: error });
  }
};

const deleteAllHolidays = async (req, res) => {
  try {
    const { Role } = req.user;
    if (Role !== "HR") {
      return res.status(403).json({ message: "Access denied" });
    }
    await Holiday.deleteMany({});
    res.status(200).json({ message: "All holidays deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting holidays", error: error.message });
  }
};

export {
  addHoliday,
  getHolidays,
  deleteHoliday,
  updateHoliday,
  getHolidayById,
  deleteAllHolidays,
};
