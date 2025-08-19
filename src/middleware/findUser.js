import { userModel } from "../models/User.js";

export const findUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(401).json({
        message: "id is not provided",
        success: false,
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(401).json({
        message: "user not found",
        success: false,
      });
    }

    console.log(user);
    req.user = user;

    next();
  } catch (error) {
    return res.status(501).json({
      message: error.message,
      success: false,
    });
  }
};
