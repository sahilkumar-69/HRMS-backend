import { userModel } from "../models/User.model.js";

export const givePolicyEditPermissionToHr = async (req, res) => {
  const { Role } = req.user;
  if (Role !== "ADMIN") {
    return res.json({
      message: "Access denied",
      success: false,
    });
  }

  try {
    const hr = await userModel.findOneAndUpdate(
      { Role: "HR" },
      {
        $addToSet: { Permissions: "EDIT_POLICY" },
      },
      { new: true }
    );

    if (!hr) {
      return res.json({
        message: "HR not found",
        success: false,
      });
    }

    return res.json({
      success: true,
      message: "Access granted",
      hr,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      error,
    });
  }
};

export const removePolicyPermissionFromHr = async (req, res) => {
  const { Role } = req.user;
  if (Role !== "ADMIN") {
    return res.json({
      message: "Access denied",
      success: false,
    });
  }

  try {
    const hr = await userModel.findOneAndUpdate(
      { Role: "HR" },
      {
        $pull: { Permissions: "" },
      },
      { new: true }
    );

    if (!hr) {
      return res.json({
        message: "HR not found",
        success: false,
      });
    }

    return res.json({
      success: true,
      message: "Access removed",
      hr,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
      error,
    });
  }
};
