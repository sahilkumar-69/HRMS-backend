import TaskUpdate from "../models/dailyTaskUpdate.model.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// Create a new daily task update
export const addDailyUpdate = async (req, res) => {
  try {
    const { title, description } = req.body;
    var uploadedFile;

    console.log("FILE", req?.file || req?.files || "no file");

    if (req.file) {
      uploadedFile = await uploadOnCloudinary(
        req.file.path,
        "HRMS_DAILY_UPDATES"
      );

      console.log(uploadedFile);

      if (!uploadedFile.success) {
        return res.status(501).json({
          error: uploadedFile.message,
          message: "File not upload, try again",
        });
      }
    }

    console.log("user", req.user);

    const newUpdate = new TaskUpdate({
      title,
      description,
      role: req.user.Role,
      name: req.user.FirstName,
      public_id: uploadedFile?.response.public_id || null,
      secure_url: uploadedFile?.response.secure_url || null,
    });

    await newUpdate.save();

    res.status(201).json({
      success: true,
      message: "Task update created successfully",
      data: newUpdate,
    });
  } catch (error) {
    await deleteFromCloudinary(uploadedFile.response.public_id);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all updates (optional: filter by role or name)
export const getTaskUpdates = async (req, res) => {
  try {
    const { role, name } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (name) filter.name = name;

    const updates = await TaskUpdate.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
