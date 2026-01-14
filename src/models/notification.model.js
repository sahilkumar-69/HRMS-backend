import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "users", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Object }, // optional extra info (taskId, leaveId, etc.)
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ["Personal", "General"], default: "General" },
  },
  { timestamps: true }
);

export const Notification = model("Notification", notificationSchema);
