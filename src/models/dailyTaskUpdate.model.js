import mongoose from "mongoose";

const taskUpdateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    public_id: {
      type: String, // store image URL / path
      default: null,
    },
    secure_url: {
      type: String, // store image URL / path
      default: null,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const dailyUpdates =  mongoose.model("TaskUpdate", taskUpdateSchema);
