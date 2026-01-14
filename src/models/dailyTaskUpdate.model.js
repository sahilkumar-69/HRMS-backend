// import mongoose from "mongoose";

// const taskUpdateSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     public_id: {
//       type: String, // store image URL / path
//       default: null,
//     },
//     secure_url: {
//       type: String, // store image URL / path
//       default: null,
//     },
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//     },
//   },
//   { timestamps: true }
// );

// export const dailyUpdates = mongoose.model("TaskUpdate", taskUpdateSchema);

import mongoose from "mongoose";

const dailyUpdateSchema = new mongoose.Schema(
  {
    //   Task reference (MANDATORY)
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },

    //  Employee who updated
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    //  Who made update (role snapshot)
    role: {
      type: String,
      enum: ["EMPLOYEE", "TL", "ADMIN", "HR"],
      required: true,
    },

    //  Update content
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    // Optional proof
    public_id: {
      type: String,
      default: null,
    },

    secure_url: {
      type: String,
      default: null,
    },

    //   Progress logic
    progressAdded: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    //   Status snapshot AFTER update
    statusAfterUpdate: {
      type: String,
      enum: ["IN_PROGRESS", "BLOCKED", "COMPLETED"],
      default: "IN_PROGRESS",
    },

    //   Used for 1-update-per-day rule
    updateDate: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
  },
  { timestamps: true }
);

//   Prevent multiple updates per task per day per employee
dailyUpdateSchema.index(
  { task: 1, employee: 1, updateDate: 1 },
  { unique: true }
);

export const dailyUpdates = mongoose.model("DailyUpdate", dailyUpdateSchema);
