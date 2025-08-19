import { userModel } from "../models/User.js";
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
    EmergencyContacts,
    Role,
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

    const addressStatus = await addAddress(Address);

    if (!addressStatus.success) {
      return res.status(400).json({
        message: addressStatus.message,
      });
    }

    const emergencyStatus = await addEmergencyDetails(EmergencyContacts);

    if (!emergencyStatus.success) {
      return res.status(400).json({
        message: emergencyStatus.message,
      });
    }

    const user = new userModel({
      FirstName,
      LastName,
      Email,
      Phone,
      Dob,
      Department,
      Designation,
      Permissions,
      Address: addressStatus.address,
      EmergencyContacts: emergencyStatus.detailId,
      Role,
      Password,
    });

    const accessToken = user.generateAccessToken();

    user.Token = accessToken;

    const savedUser = await user.save();
    console.log(savedUser);

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
    const { Address, EmergencyContacts, ...updates } = req.body; // fields to update (e.g. { address: {...} })

    // Ensure HR/Owner cannot update restricted fields
    const restricted = ["Password", "Role", "Permissions"];
    restricted.forEach((field) => {
      if (updates[field]) delete updates[field];
    });

    if (Address) {
      const updatedAdd = await updateAddress(req.user.Address, Address);

      if (!updatedAdd.success) {
        return res.status(404).json({ message: updatedAdd.message });
      }

      await userModel.findByIdAndUpdate(
        req.user._id,
        { $set: { Address: updatedAdd.id } },
        { new: true, runValidators: true }
      );
    }

    if (EmergencyContacts) {
      const updatedDetails = await updateEmergencyDetails(
        req.user.EmergencyContacts,
        EmergencyContacts
      );

      if (!updatedDetails.success) {
        return res.status(404).json({ message: updatedDetails.message });
      }

      await userModel.findByIdAndUpdate(
        req.user._id,
        { $set: { EmergencyContacts: updatedDetails.id } },
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

      if (!isDeleted) {
        return res.status(400).json({
          message: "can't delete from database",
          success: false,
        });
      }

      const isAddressRemoved = await deleteAddress(isDeleted.Address);

      if (!isAddressRemoved) {
        return res.status(400).json({
          message: isAddressRemoved.message,
          success: false,
        });
      }

      const isContactRemoved = await deleteEmergencyDetails(
        isDeleted.EmergencyContacts
      );

      if (!isContactRemoved) {
        return res.status(400).json({
          message: isContactRemoved.message,
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

export { userLogin, userSignUp, updateUser, deleteUser, getUserById };
