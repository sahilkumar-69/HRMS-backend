import { Schema, model } from "mongoose";

const Holiday_schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Holiday = model("Holiday", Holiday_schema);
export default Holiday;
