// import { response } from "express";
import { policies } from "../models/policy.model.js";
import { userModel } from "../models/User.model.js";

import { sendNotification } from "../utils/sendNotification.js";

const addPolicy = async (req, res) => {
  const { Role, FirstName, LastName, _id: adminId } = req.user;
  const { policy: newPolicy } = req.body;
  console.log("editor data", newPolicy);

  if (!newPolicy) {
    return res.status(400).json({
      success: false,
      message: "Policy content is required",
    });
  }

  try {
    //  Role-based access
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can add policies.",
      });
    }

    //  Save to DB
    const policy = await policies.create({ policies: newPolicy });

    console.log("policy_model", policy);

    // Notify all HR & employees
    const allUsers = await userModel.find({}, "_id");
    const recipientIds = allUsers.map((u) => u._id.toString());

    await sendNotification({
      recipients: recipientIds,
      title: "New Company Policy",
      message: `A new company policy has been added by ${FirstName} ${LastName}. Please review the latest document.`,
      data: {
        policyId: policy._id,

        uploadedBy: adminId,
      },
      type: "General",
    });

    return res.status(201).json({
      success: true,
      message: "Policy added successfully",
      policy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updatePolicy = async (req, res) => {
  const { Role, FirstName, LastName, _id: adminId } = req.user;

  const { policy: updatedPolicy, id } = req.body;

  if (!updatedPolicy) {
    return res.status(400).json({
      success: false,
      message: "Policy content is required",
    });
  }

  try {
    //  Role-based access
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can update policies.",
      });
    }

    //  Find existing policy
    let policy = await policies.findByIdAndUpdate(
      { _id: id },
      { policies: updatedPolicy },
      { new: true }
    );

    //  Send notification to all users
    const allUsers = await userModel.find({}, "_id");
    const recipientIds = allUsers.map((u) => u._id.toString());

    await sendNotification({
      recipients: recipientIds,
      title: "Company Policy Updated",
      message: `The company policy has been updated by ${FirstName} ${LastName}. Please review the latest version.`,
      data: {
        policyId: policy._id,
        secure_url: policy.secure_url,
        updatedBy: adminId,
      },
      type: "General",
    });

    return res.json({
      success: true,
      message: "Policy updated successfully",
      policy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating policy",
      error: error.message,
    });
  }
};

const getPolicy = async (req, res) => {
  try {
    const policy = await policies.findOne();

    if (!policy) {
      return res.status(200).json({
        success: false,
        message: "Policy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policies fetched successfully",
      policy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

const deletePolicy = async (req, res) => {
  const { Role, FirstName, LastName, _id: adminId } = req.user;
  const { id } = req.params;

  console.log(id);

  try {
    //  Role check
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can delete policies.",
      });
    }

    //  Find policy
    const policy = await policies.findByIdAndDelete(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    //  Notify all users about deletion
    const allUsers = await userModel.find({}, "_id");
    const recipientIds = allUsers.map((u) => u._id.toString());

    await sendNotification({
      recipients: recipientIds,
      title: "Company Policy Removed",
      message: `An old company policy has been deleted by ${FirstName} ${LastName}.`,
      data: {
        deletedPolicyId: id,
        deletedBy: adminId,
      },
      type: "General",
    });

    return res.status(200).json({
      success: true,
      message: "Policy deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export { addPolicy, deletePolicy, updatePolicy, getPolicy };
