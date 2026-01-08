import dotenv from "dotenv";
dotenv.config();
import { userModel } from "../models/User.model.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
        success: false,
      });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

    const user = await userModel.findById(decodedToken._id).select("-Password");

    if (!user) {
      return res.status(401).json({
        message: "unauthorized token. User not found",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(501).json({
      message: error.message,
      success: false,
      error,
    });
  }
};
