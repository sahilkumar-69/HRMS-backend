import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "users", // The user who will receive this notification
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "users", // Who triggered the notification (optional for system)
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["TASK", "LEAVE", "EVENT", "SYSTEM", "MESSAGE"],
      default: "SYSTEM",
    },
    relatedEntity: {
      type: Schema.Types.ObjectId,
      refPath: "entityModel", // dynamically reference Task, Event, etc.
    },
    entityModel: {
      type: String,
      enum: ["Task", "Leave", "Event", "users"], // models you want to link
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export const Notification = model("notifications", notificationSchema);
