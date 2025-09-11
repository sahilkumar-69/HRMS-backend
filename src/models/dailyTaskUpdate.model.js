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
    img: {
      type: String, // store image URL / path
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["HR", "ADMIN", "TL", "EMPLOYEE"], // optional: restrict to roles
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TaskUpdate", taskUpdateSchema);
