// import { response } from "express";
import { policies } from "../models/policy.model.js";
import { userModel } from "../models/User.model.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { sendNotification } from "../utils/sendNotification.js";

const addPolicy = async (req, res) => {
  const { Role, FirstName, LastName, _id: adminId } = req.user;

  // console.log(req.body)
  // console.log(req.body)
  let docs = {
    public_id: "",
    secure_url: "",
  };

  try {
    //  Role-based access
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can add policies.",
      });
    }

    //  Upload policy file
    console.log(req.file);
    if (req.file) {
      const uploads = await uploadOnCloudinary(req.file.path, "HRMS_POLICIES");
      if (!uploads.success) {
        return res.status(400).json({
          success: false,
          message: uploads.message || "File upload failed",
        });
      }
      docs.public_id = uploads.response.public_id;
      docs.secure_url = uploads.response.secure_url;
    } else {
      return res.status(404).json({
        success: false,
        message: "No policy file provided",
      });
    }

    //  Save to DB
    const policy = await policies.create(docs);

    // Notify all HR & employees
    const allUsers = await userModel.find({}, "_id");
    const recipientIds = allUsers.map((u) => u._id.toString());

    await sendNotification({
      recipients: recipientIds,
      title: "New Company Policy",
      message: `A new company policy has been added by ${FirstName} ${LastName}. Please review the latest document.`,
      data: {
        policyId: policy._id,
        secure_url: docs.secure_url,
        uploadedBy: adminId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Policy added successfully",
      policy,
    });
  } catch (error) {
    // Cleanup Cloudinary file if DB save fails
    if (docs.public_id) {
      await deleteFromCloudinary(docs.public_id);
    }
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updatePolicy = async (req, res) => {
  const { Role, FirstName, LastName, _id: adminId } = req.user;

  let docs = {
    public_id: "",
    secure_url: "",
  };

  try {
    //  Role-based access
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can update policies.",
      });
    }

    //  Upload new file if provided
    if (req.file) {
      const uploads = await uploadOnCloudinary(req.file.path, "HRMS_POLICIES");
      if (!uploads.success) {
        return res
          .status(400)
          .json({ success: false, message: uploads.message });
      }
      docs.public_id = uploads.response.public_id;
      docs.secure_url = uploads.response.secure_url;
    }

    //  Find existing policy
    let policy = await policies.findOne();

    if (policy) {
      // Delete old file if new file uploaded
      if (docs.public_id && policy.public_id) {
        await deleteFromCloudinary(policy.public_id);
      }

      if (docs.public_id) policy.public_id = docs.public_id;
      if (docs.secure_url) policy.secure_url = docs.secure_url;

      await policy.save();
    } else {
      // Create new if none exists
      policy = await policies.create(docs);
    }

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
    });

    return res.json({
      success: true,
      message: "Policy updated successfully",
      policy,
    });
  } catch (error) {
    // Rollback if DB fails
    if (docs.public_id) {
      await deleteFromCloudinary(docs.public_id);
    }
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
      return res.status(404).json({
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

  try {
    //  Role check
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can delete policies.",
      });
    }

    //  Find policy
    const policy = await policies.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    //  Delete file from Cloudinary if exists
    if (policy.public_id) {
      await deleteFromCloudinary(policy.public_id);
    }

    //  Delete from DB
    await policy.deleteOne();

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
    });

    return res.status(200).json({
      success: true,
      message: "Policy deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting policy",
      error: error.message,
    });
  }
};

export { addPolicy, deletePolicy, updatePolicy, getPolicy };
