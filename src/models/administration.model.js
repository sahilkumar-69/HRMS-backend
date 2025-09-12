import { Schema, model } from "mongoose";

const administrationSchema = new Schema(
  {
    accessories: [{ type: Schema.Types.Mixed, default: [] }],
    services: [{ type: Schema.Types.Mixed, default: [] }],
    miscellaneous: [{ type: Schema.Types.Mixed, default: [] }],
  },
  { timestamps: true }
);

export default model("administration", administrationSchema);
