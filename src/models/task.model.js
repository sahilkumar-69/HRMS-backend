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

    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    // Assignee is a reference to a User
    assignee: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    assigner: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "BLOCKED",
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "REVIEWED",
      ],
      default: "ASSIGNED",
    },
  },
  { timestamps: true }
);

const taskModel = mongoose.model("Task", TaskSchema);
export default taskModel;
