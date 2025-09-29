import { Schema, model } from "mongoose";

const expense_schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

export const expense = model("expense", expense_schema);
