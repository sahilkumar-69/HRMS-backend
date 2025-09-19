import { Schema, model } from "mongoose";

const sale_schema = new Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    subHeading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    budget: {
      type: String,
      required: true,
    },
    docs: [
      {
        public_id: String,
        secure_url: String,
      },
    ],
    employee: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const sales = model("sales", sale_schema);
