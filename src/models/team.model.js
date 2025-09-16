import mongoose from "mongoose";
const { Schema } = mongoose;

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    // One team lead
    lead: { type: Schema.Types.ObjectId, ref: "users", required: true },

    // Members of the team
    members: [{ type: Schema.Types.ObjectId, ref: "users" }],

    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

export default mongoose.model("Team", TeamSchema);
