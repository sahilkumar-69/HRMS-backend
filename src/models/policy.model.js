import { Schema, model } from "mongoose";

const policy_schema = new Schema(
  {
    policies: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const policies = model("policies", policy_schema);
