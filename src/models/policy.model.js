import { Schema, model } from "mongoose";

const policy_schema = new Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    subHeading: {
      type: String,
      //   required: true,
    },
    descriptions: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const policies = model("policies", policy_schema);
