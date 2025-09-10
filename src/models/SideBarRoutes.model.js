// models/leaveModel.js
import mongoose, { Schema } from "mongoose";

const routesSchema = new Schema(
  {
    routes: [
      {
        title: { type: String, required: true },
        path: { type: String, required: true },
        icon: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("sidebar", routesSchema);
