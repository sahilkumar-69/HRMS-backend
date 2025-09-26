import { Schema, model } from "mongoose";

const policy_schema = new Schema(
  {
    public_id: String,
    secure_url: String,
  },
  { timestamps: true }
);

export const policies = model("policies", policy_schema);
