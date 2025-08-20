import { userModel } from "../models/User.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { isUserExists } from "../utils/IsUserExists.js";
import {
  addAddress,
  deleteAddress,
  updateAddress,
} from "./address.controller.js";
import {
  addEmergencyDetails,
  deleteEmergencyDetails,
  updateEmergencyDetails,
} from "./emergency.controller.js";

const userLogin = async (req, res) => {
  try {
    const { Role, Password, Email } = req.body;

    if (!Role && !Email) {
      return res.status(404).json({
        message: "Email or Role is required",
      });
    }
    if (!Password || Password.length < 8) {
      return res.status(404).json({
        message: "Password is required and min 8 character required",
      });
    }

    const isExists = await isUserExists(Email, Role);

    if (!isExists) {
      return res.status(404).json({
        success: true,
        message: "User not found please signup",
      });
    }

    const isPasswordMatch = await isExists.comparePassword(Password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "password don't match ",
      });
    }

    const accessToken = await isExists.generateAccessToken();

    return res.status(200).json({
      success: true,
      message: "logged in ",
      user: {
        Name: isExists.Name,
        Email: isExists.Email,
        Role: isExists.Role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("erron in log in ", error);
    return res.status(501).json({
      message: "internal server error",
    });
  }
};

const userSignUp = async (req, res) => {
  console.log(req.body);

  const {
    FirstName,
    LastName,
    Email,
    Phone,
    Dob,
    Department,
    Designation,
    Permissions,
    Address,
    Role,
    EmergencyPhone,
    EmergencyName,
    EmergencyRelation,
    Password,
  } = req.body;

  if (
    [
      FirstName,
      LastName,
      Email,
      Phone,
      Dob,
      Department,
      Designation,
      Role,
      Address,
      EmergencyPhone,
      EmergencyName,
      EmergencyRelation,
      Password,
    ].some((ele) => {
      return ele == undefined || ele == ""
        ? true
        : ele?.trim() == ""
        ? true
        : false;
    })
  ) {
    return res.status(404).json({
      message: "all fields are required",
    });
  }

  if (Password.length < 8) {
    return res.status(404).json({
      message: "Password is required and min 8 character required",
    });
  }

  try {
    const isExists = await isUserExists(Email, Role);

    if (isExists) {
      return res.status(200).json({
        message: "Email already in use",
      });
    }

    if (!req.file || !req.file.path) {
      return req.status(404).json({
        message: "Profile Photo is not uploaded (file path missing)",
      });
    }
    const fileStr = req.file.path;

    const cloudRes = await uploadOnCloudinary(fileStr);

    console.log(cloudRes);

    if (!cloudRes) {
      return res
        .status(400)
        .json({ message: "could not uploaded to cloudinary", success: false });
    }

    const user = new userModel({
      FirstName,
      LastName,
      Email,
      Phone,
      Dob,
      Department,
      Profile_url: cloudRes.response.secure_url,
      Profile_Public_id: cloudRes.response.public_id,
      Designation,
      Permissions,
      Address,
      EmergencyPhone,
      EmergencyName,
      EmergencyRelation,
      Role,
      Password,
    });

    const accessToken = user.generateAccessToken();

    user.Token = accessToken;

    const savedUser = await user.save();

    if (!savedUser)
      return res.status(500).json({
        success: false,
        message: "Can't save to db",
      });

    res.status(201).json({
      success: true,
      message: "User signup successfully",
      user: savedUser,
      // accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Can't save to db",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = req.body; // fields to update (e.g. { address: {...} })

    // Ensure HR/Owner cannot update restricted fields
    const restricted = ["Password", "Role", "Permissions"];
    restricted.forEach((field) => {
      if (updates[field]) delete updates[field];
    });

    if (req.file && req.file.path) {
      const deleteCurrentPhoto = await deleteFromCloudinary(
        req.user.Profile_Public_id
      );

      if (!deleteCurrentPhoto.success) {
        return res.status(500).json({
          message: deleteCurrentPhoto.message,
        });
      }

      const updatedURL = await uploadOnCloudinary(req.file.path);

      if (!updatedURL.success) {
        return res.status(404).json({ message: updatedURL.message });
      }

      await userModel.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            Profile_url: updatedURL.response.public_id,
            Profile_Public_id: updatedURL.response.secure_url,
          },
        },
        { new: true, runValidators: true }
      );
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      )
      .select("-Password ");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;

    if (id && id.trim()) {
      const isDeleted = await userModel.findByIdAndDelete(id);

      const cloudDelete = await deleteFromCloudinary(
        isDeleted.Profile_Public_id
      );

      console.log(cloudDelete);

      if (!isDeleted) {
        return res.status(400).json({
          message: "can't delete from database",
          success: false,
        });
      }

      return res.status(200).json({
        message: "deleted",
        success: true,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id.trim()) {
      const user = await userModel
        .findById(id)
        .select("-Password -Token -EmergencyContacts -Address -_id");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      return res.status(200).json({
        message: "User found",
        user,
        success: true,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

const assignTask = async (taskId, to) => {
  try {
    const updatedUser = await userModel
      .findByIdAndUpdate(
        to,
        { $addToSet: { Tasks: taskId } }, // prevents duplicates
        { new: true } // return updated user
      )
      .populate("Tasks", "title description priority due_date status");

    return updatedUser;
  } catch (error) {
    throw new Error("Error assigning task: " + error.message);
  }
};

export {
  userLogin,
  userSignUp,
  updateUser,
  deleteUser,
  getUserById,
  assignTask,
};
