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

    dueDate: { type: Date },

    createdBy: { type: Schema.Types.ObjectId, ref: "users" },

    updatedBy: { type: Schema.Types.ObjectId, ref: "users" },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const expense = model("expense", expense_schema);
