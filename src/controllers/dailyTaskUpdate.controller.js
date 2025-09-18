import { dailyUpdates } from "../models/dailyTaskUpdate.model.js";
import { userModel } from "../models/User.model.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// Create a new daily task update
export const addDailyUpdate = async (req, res) => {
  try {
    const { title, description } = req.body;
    var uploadedFile;

    // console.log("FILE", req?.file || req?.files || "no file");

    if (req.file) {
      uploadedFile = await uploadOnCloudinary(
        req.file.path,
        "HRMS_DAILY_UPDATES"
      );

      // console.log(uploadedFile);

      if (!uploadedFile.success) {
        return res.status(501).json({
          error: uploadedFile.message,
          message: "File not upload, try again",
        });
      }
    }

    // console.log("user", req.user);

    const newUpdate = await dailyUpdates.create({
      title,
      description,
      employee: req.user._id,
      public_id: uploadedFile?.response?.public_id || null,
      secure_url: uploadedFile?.response?.secure_url || null,
    });

    if (newUpdate._id) {
      newUpdate.employee = await userModel
        .findById(req.user._id)
        .select("FirstName Role Department ");
    }

    res.status(201).json({
      success: true,
      message: "Task update created successfully",
      data: newUpdate,
    });
  } catch (error) {
    if (uploadedFile?.response)
      await deleteFromCloudinary(uploadedFile?.response?.public_id);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all updates (optional: filter by role or name)
export const getDailyTaskUpdates = async (req, res) => {
  try {
    const { Role, _id } = req.user;

    let prevUpdates;

    if (Role === "TL" || Role === "ADMIN") {
      prevUpdates = await dailyUpdates
        .find()
        .populate("employee", "FirstName LastName Email Role Department")
        .sort({ createdAt: -1 });
    } else {
      prevUpdates = await dailyUpdates
        .find({ employee: _id })
        .populate("employee", "FirstName LastName Email Role Department")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched",
      count: prevUpdates.length,
      prevUpdates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
