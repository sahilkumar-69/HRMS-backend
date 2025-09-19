import { userModel } from "../models/User.model.js";
// import fs from "fs";

import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { isUserExists } from "../utils/IsUserExists.js";
import { generateToken } from "../utils/generateToken.js";

const userLogin = async (req, res) => {
  try {
    const { Role, Password, Email } = req.body;

    if (!Email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!Password || Password.length < 8) {
      return res.status(403).json({
        success: false,
        message: "Password is required and must be at least 8 characters",
      });
    }

    const isExists = await userModel.findOne({ Email });
    if (!isExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (Role && isExists.Role !== Role) {
      return res.status(403).json({
        success: false,
        message: "No user with this role",
      });
    }

    const isPasswordMatch = await isExists.comparePassword(Password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password doesn't match",
      });
    }

    const accessToken = isExists.generateAccessToken();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: isExists,
      accessToken,
    });
  } catch (error) {
    console.error("Error in login", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userSignUp = async (req, res) => {
  const {
    FirstName,
    LastName,
    Email,
    Phone,
    Dob,
    Department,
    // Designation,
    Permissions,
    Address,
    Role,
    EmergencyPhone,
    EmergencyName,
    EmergencyRelation,
    JoiningDate,
    Password,
    AllowedTabs,
  } = req.body;

  // console.log(req.body);

  if (
    [
      FirstName,
      Email,
      Phone,
      Dob,
      Department,
      // Designation,
      Role,
      Address,
      EmergencyPhone,
      EmergencyName,
      EmergencyRelation,
      Password,
      JoiningDate,
    ].some((ele) => {
      return ele == undefined || ele == ""
        ? true
        : ele?.trim() == ""
        ? true
        : false;
    })
  ) {
    return res.status(404).json({
      success: false,
      message: "all fields are required",
    });
  }

  if (Password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password is required and min 8 character required",
    });
  }

  try {
    const isExists = await isUserExists(Email, Role);

    if (isExists) {
      return res.status(403).json({
        success: false,
        message: "Email already in use",
      });
    }

    if (!req.file || !req.file.path) {
      return res.status(404).json({
        message: "Profile Photo is not uploaded (file path missing)",
      });
    }
    const fileStr = req.file?.path;

    var cloudRes = await uploadOnCloudinary(fileStr);

    if (!cloudRes) {
      cloudRes && (await deleteFromCloudinary(cloudRes.response.public_id));
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
      // Designation,
      Permissions,
      Address,
      JoiningDate,
      EmergencyPhone,
      EmergencyName,
      EmergencyRelation,
      Role,
      AllowedTabs: AllowedTabs,
      Password,
    });

    const savedUser = await user.save();

    if (!savedUser) {
      cloudRes && (await deleteFromCloudinary(cloudRes.response.public_id));

      return res.status(500).json({
        success: false,
        message: "Can't save to db",
      });
    }

    res.status(201).json({
      success: true,
      message: "User signup successfully",
      user: savedUser,
      // accessToken,
    });
  } catch (error) {
    cloudRes && (await deleteFromCloudinary(cloudRes.response.public_id));

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

      if (isDeleted?.Profile_Public_id)
        await deleteFromCloudinary(isDeleted.Profile_Public_id);

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

const getAllEmp = async (req, res) => {
  try {
    const Emps = await userModel.find().select("-Password");

    const allEmployees = {
      HR: Emps.filter((emp) => emp.Role == "HR"),
      ADMIN: Emps.filter((emp) => emp.Role == "ADMIN"),
      TL: Emps.filter((emp) => emp.Role == "TL"),
      EMPLOYEE: Emps.filter((emp) => emp.Role == "EMPLOYEE"),
    };
    return res.status(200).json({
      message: "Emp fetched",
      success: true,
      data: allEmployees,
    });
  } catch (error) {
    res.json(500).json({
      error,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id.trim()) {
      const user = await userModel.findById(id).select("  -Token  -_id");

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

export {
  userLogin,
  userSignUp,
  updateUser,
  deleteUser,
  getUserById,
  getAllEmp,
};
