import dotenv from "dotenv";
dotenv.config();
import { userModel } from "../models/User.model.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
        success: false,
      });
    }

    // console.log(process.env.SECRET_TOKEN);

    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

    // console.log("decoded token ", decodedToken);

    // if (!decodedToken) {
    //   return res.status(401).json({
    //     message: "unauthorized token",
    //     success: false,
    //   });
    // }

    const user = await userModel
      .findById(decodedToken._id)
      .select("-Password  ");

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
      error,
    });
  }
};
// import { userModel } from "../models/User.js";
// import jwt from "jsonwebtoken";

// export const authMiddleware = async (req, res, next) => {
//   try {
//     // console.log("VERIFY SECRET:", process.env.ACCESS_TOKEN);

//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token)
//       return res
//         .status(401)
//         .json({ message: "No token, authorization denied" });
//     console.log("RECEIVED TOKEN:", token);

//     const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
//     const user = await userModel.findById(decoded._id).lean();

//     if (!user) return res.status(401).json({ message: "Invalid user" });

//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Token is not valid", error: err.message });
//   }
// };
