import { Schema, model } from "mongoose";

const policy_schema = new Schema({}, { timestamps: true, strict: false });

export const policies = model("policies", policy_schema);
