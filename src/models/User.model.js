import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    EmployeeId: {
      type: String,
      unique: true,
      required: true,
      default: () =>
        `EMP-${new mongoose.Types.ObjectId()
          .toString()
          .slice(-6)
          .toUpperCase()}`,
    },

    // Basic info
    FirstName: { type: String, required: true },

    LastName: String,

    Email: { type: String, required: true, unique: true, lowercase: true },

    Phone: String,

    Profile_url: String,

    Profile_Public_id: String,

    Dob: { type: Date },
    // Job-related info
    Department: { type: String, required: true },

    Tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    // Designation: { type: String, require: true },

    JoiningDate: { type: Date, default: Date.now },
    // Security
    Password: { type: String, required: true }, // should be hashed with bcrypt

    IsActive: { type: Boolean, default: true },
    // Access control
    Permissions: [{ type: String }], // fine-grained, e.g., ["manage_users", "approve_leave"]
    // Relational fields
    // ManagerId: { type: Schema.Types.ObjectId, ref: "User" }, // self-reference for reporting
    Address: { type: String, require: true },

    AllowedTabs: [{ type: String }],

    Notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "notifications" },
    ],

    Leaves: [{ type: mongoose.Schema.Types.ObjectId, ref: "leaveModel" }],

    EmergencyName: {
      type: String,
      require: true,
    },

    EmergencyRelation: {
      type: String,
      require: true,
    },

    EmergencyPhone: {
      type: String,
      require: true,
    },

    JoinedTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],

    Role: {
      type: String,
      enum: ["HR", "EMPLOYEE", "TL", "ADMIN"],
      require: true,
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "userModel" },

    updatedBy: { type: Schema.Types.ObjectId, ref: "userModel" },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();

  this.Password = await bcrypt.hash(this.Password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.Password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      Permissions: this.Permissions,
      Email: this.Email,
      Role: this.Role,
    },
    process.env.SECRET_TOKEN,
    {
      expiresIn: "1d" || process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const userModel = mongoose.model("users", userSchema);
