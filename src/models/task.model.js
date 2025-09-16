import mongoose from "mongoose";

const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    docs: [
      {
        public_id: { type: String },
        secure_url: { type: String },
      },
    ],

    startDate: { type: Date, default: Date.now() },
    dueDate: { type: Date, required: true },
    // Assignee is a reference to a User
    assignee: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],

    assigner: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    status: {
      type: String,
      enum: ["todo", "pending", "in-progress", "review"],
      default: "todo",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
