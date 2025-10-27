import Ticket from "../models/ticket.model.js";
import { userModel } from "../models/User.model.js";
import { sendNotification } from "../utils/sendNotification.js";

const createTicket = async (req, res) => {
  let newTicket;
  try {
    const { title, description, priority } = req.body;
    const { _id, FirstName, LastName } = req.user;
    newTicket = await Ticket.create({
      title,
      description,
      priority,
      updatedBy: _id,
      createdBy: _id,
    });

    if (!newTicket) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create ticket" });
    }

    const members = await userModel.find({ Role: "ADMIN" }).select("_id");

    await sendNotification({
      recipients: members.map((id) => id._id.toString()),
      title: "New Ticket Created",
      message: `${FirstName} ${LastName} raised a new ticket`,
      data: {
        id: newTicket._id,
      },
    });

    res.status(201).json({ success: true, newTicket });
  } catch (error) {
    console.log(error);
    newTicket && (await Ticket.findByIdAndDelete(newTicket._id));
    res.status(500).json({ success: false, message: error.message, error });
  }
};

const getTickets = async (req, res) => {
  const { Role, _id } = req.user;
  // console.log(Role, _id);
  let tickets;
  try {
    if (Role === "ADMIN") {
      tickets = await Ticket.find()
        .populate("updatedBy", "FirstName LastName ")
        .populate("createdBy", "FirstName LastName ");
    } else {
      tickets = await Ticket.find({ createdBy: _id }).populate(
        "updatedBy",
        "FirstName LastName "
      );
      // .populate("createdBy", "FirstName LastName ")
      // .populate("updatedBy", "FirstName LastName ");
    }

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: true, message: error.message, error });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, updatedBy } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { title, description, priority, status, updatedBy },
      { new: true }
    );
    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket", error });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { _id, Role, FirstName, LastName } = req.user;
    const { id } = req.params;

    if (Role !== "ADMIN") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await Ticket.findByIdAndUpdate(
      id,
      { status: "Acknowledged", updatedBy: _id },
      { new: true }
    );

    const members = await userModel.find({ Role: "ADMIN" }).select("_id ");

    await sendNotification({
      recipients: members.map((id) => id._id.toString()),
      title: "Ticket acknowledged",
      message: `${FirstName} ${LastName} acknowledged your ticket`,
      data: {},
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message, error });
  }
};

const deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message, error });
  }
};

export {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
};
