import { response } from "express";
import { policies } from "../models/policy.model.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
const addPolicy = async (req, res) => {
  const { Role } = req.user;
  let docs = {
    public_id: "",
    secure_url: "",
  };

  try {
    //  Role-based access control
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can add policies.",
      });
    }

    //  Upload file if provided
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
    }

    //  Optional: restrict to one active policy at a time
    // await policies.deleteMany({}); // uncomment if you want only one

    //  Save to DB
    const policy = await policies.create(docs);

    return res.status(201).json({
      success: true,
      message: "Policy added successfully",
      policy,
    });
  } catch (error) {
    // Cleanup uploaded file if DB save fails
    if (docs.public_id) {
      await deleteFromCloudinary(docs.public_id);
    }

    return res.status(500).json({
      success: false,
      message: "Server error while adding policy",
      error: error.message,
    });
  }
};

const updatePolicy = async (req, res) => {
  let docs = {
    public_id: "",
    secure_url: "",
  };

  try {
    // Upload new file if provided
    if (req.file) {
      const uploads = await uploadOnCloudinary(req.file.path, "HRMS_POLICIES");

      if (!uploads.success) {
        return res.json({ success: false, message: uploads.message });
      }

      docs.public_id = uploads.response.public_id;
      docs.secure_url = uploads.response.secure_url;
    }

    // Find the existing policy (assuming only one policy exists in DB)
    let policy = await policies.findOne();

    if (policy) {
      // Delete old file from cloudinary if exists
      if (policy.public_id) {
        await deleteFromCloudinary(policy.public_id);
      }

      // Update policy fields
      policy.public_id = docs.public_id;
      policy.secure_url = docs.secure_url;

      await policy.save();
    } else {
      // If no policy exists, create new
      policy = await policies.create(docs);
    }

    return res.json({
      message: "Policy updated successfully",
      success: true,
      policy,
    });
  } catch (error) {
    // Rollback: delete newly uploaded file if DB operation fails
    if (docs.public_id) {
      await deleteFromCloudinary(docs.public_id);
    }

    return res.json({
      message: error.message,
      success: false,
    });
  }
};

const getPolicy = async (req, res) => {
  try {
    const policy = await policies.find();

    if (!policy || policy.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No policies found",
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
      message: "Server error while fetching policies",
      error: error.message,
    });
  }
};

const deletePolicy = async (req, res) => {
  const { Role } = req.user;
  const { id } = req.params;

  try {
    //  Check role
    if (Role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can delete policies.",
      });
    }

    //   Find policy
    const policy = await policies.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    //   Delete file from Cloudinary if exists
    if (policy.public_id) {
      await deleteFromCloudinary(policy.public_id);
    }

    //   Delete from DB
    await policy.deleteOne();

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
