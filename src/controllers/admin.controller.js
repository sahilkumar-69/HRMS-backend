import { userModel } from "../models/User.model.js";
import { sendNotification } from "../utils/sendNotification.js";

export const givePolicyEditPermissionToHr = async (req, res) => {
  const { Role, FirstName, LastName } = req.user;

  if (Role !== "ADMIN") {
    return res.json({
      message: "Access denied",
      success: false,
    });
  }

  try {
    const hr = await userModel.findOneAndUpdate(
      { Role: "HR" },
      { $addToSet: { Permissions: "EDIT_POLICY" } },
      { new: true }
    );

    if (!hr) {
      return res.json({
        message: "HR not found",
        success: false,
      });
    }

    //  Notify the HR about the new permission
    await sendNotification({
      recipients: hr._id,
      title: "Policy Edit Permission Granted",
      message: `You have been granted permission to edit company policies by ${FirstName} ${LastName}.`,
      data: { permission: "EDIT_POLICY" },
    });

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
  const { Role, FirstName, LastName } = req.user;

  if (Role !== "ADMIN") {
    return res.json({
      message: "Access denied",
      success: false,
    });
  }

  try {
    const hr = await userModel.findOneAndUpdate(
      { Role: "HR" },
      { $pull: { Permissions: "EDIT_POLICY" } }, //  corrected field value
      { new: true }
    );

    if (!hr) {
      return res.json({
        message: "HR not found",
        success: false,
      });
    }

    //  Notify the HR about permission removal
    await sendNotification({
      recipients: hr._id,
      title: "Policy Edit Permission Removed",
      message: `Your permission to edit company policies has been revoked by ${FirstName} ${LastName}.`,
      data: { permission: "EDIT_POLICY" },
    });

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
