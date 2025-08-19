import mongoose from "mongoose";

const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dueDate: { type: Date, required: true },

    // Assignee is a reference to a User
    assignee: {
      // type: Schema.Types.ObjectId,
      // ref: "users",
      // required: true,
      type: String,
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "done"],
      default: "todo",
    },

    createdBy: {
      // type: Schema.Types.ObjectId,
      // ref: "users", // person who created the task (HR, TL, etc.)
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", TaskSchema);
