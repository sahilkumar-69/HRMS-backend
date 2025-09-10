// models/leaveModel.js
import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Sick", "Casual", "Paid", "Unpaid", "Maternity", "Other"],
      required: true,
    },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "userModel" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "userModel" },
  },
  { timestamps: true }
);

export default mongoose.model("leaveModel", leaveSchema);
