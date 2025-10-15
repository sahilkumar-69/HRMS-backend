// models/Payslip.js

import mongoose from "mongoose";

const PayslipSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false,
  },
  payload: {
    type: Object,
    required: true,
  },

  month: {
    type: String,
    required: true,
  }, // e.g. "September 2025"

  secure_url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
  // tax: Number,
  netPay: {
    type: Number,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

const PaySlip = mongoose.model("Payslip", PayslipSchema);
export { PaySlip };
