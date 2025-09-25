import { Schema, model } from "mongoose";

const payment_Schema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    grossSalary: { type: Number, required: true },

    otherDeductions: { type: Number, default: 0 },

    remarks: String,

    month: { type: String, required: true },

    year: { type: Number, required: true },

    paymentDate: { type: Date },

    status: {
      type: String,
      enum: ["Pending", "Processed", "Rejected", "Need Correction", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default model("payment", payment_Schema);
