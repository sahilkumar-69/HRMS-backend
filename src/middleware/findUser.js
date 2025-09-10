import { userModel } from "../models/User.js";
import jwt from "jsonwebtoken";

export const findUser = async (req, res, next) => {
  try {
    const token = req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
        success: false,
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);

    if (!decodedToken) {
      return res.status(401).json({
        message: "unauthorized token",
        success: false,
      });
    }

    const user = await userModel
      .findById(decodedToken._id)
      .select("-password -refreshToken ");

    if (!user) {
      return res.status(401).json({
        message: "unauthorized token. User not found",
        success: false,
      });
    }

    req.user = user;
    next();

    // if (!id) {
    //   return res.status(401).json({
    //     message: "id is not provided",
    //     success: false,
    //   });
    // }

    // const user = await userModel.findById(id);

    // if (!user) {
    //   return res.status(401).json({
    //     message: "user not found",
    //     success: false,
    //   });
    // }

    // console.log(user);
    // req.user = user;

    // next();
  } catch (error) {
    return res.status(501).json({
      message: error.message,
      success: false,
    });
  }
};
