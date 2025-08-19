import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { addressModel } from "./address.js";
// import { emergencyContactModel } from "./emergencyContact.js";

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

    LastName: { type: String, required: true },

    Email: { type: String, required: true, unique: true, lowercase: true },

    Phone: { type: String },

    Dob: { type: Date },
    // Job-related info
    Department: { type: String, required: true },

    Designation: { type: String },

    JoiningDate: { type: Date, default: Date.now },
    // Security
    Password: { type: String, required: true }, // should be hashed with bcrypt

    IsActive: { type: Boolean, default: true },
    // Access control
    Permissions: [{ type: String }], // fine-grained, e.g., ["manage_users", "approve_leave"]
    // Relational fields
    // ManagerId: { type: Schema.Types.ObjectId, ref: "User" }, // self-reference for reporting

    Address: { type: mongoose.Schema.Types.ObjectId, ref: "addressModel" },

    EmergencyContacts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "emergencyContactModel",
    },

    Token: {
      type: String,
      require: true,
    },

    Role: {
      type: String,
      enum: ["HR", "EMPLOYEE", "TL", "OWNER"],
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
      EmployeeId: this.EmployeeId,
      Permissions: this.Permissions,
      Email: this.Email,
      Role: this.Role,
    },
    process.env.ACCESS_TOKEN,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const userModel = mongoose.model("users", userSchema);
