import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    Phone: {
      type: Number,
      require: true,
      unique: true,
      trim: true,
    },
    Password: {
      type: String,
      require: true,
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
      Name: this.Name,
      Email: this.Email,
      Phone: this.Phone,
    },
    process.env.ACCESS_TOKEN,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

export const userModel = model("users", userSchema);
