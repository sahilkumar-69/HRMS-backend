import { Schema, model } from "mongoose";

const administrationSchema = new Schema(
  {
    accessories: Object,
    services: Object,
    miscellaneous: Object,
  },
  { timestamps: true }
);

export default model("administration", administrationSchema);
