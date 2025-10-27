import { Schema, model } from "mongoose";

const ticket_schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Acknowledged", "Submitted"],
      default: "Submitted",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const Ticket = model("ticket", ticket_schema);
export default Ticket;
