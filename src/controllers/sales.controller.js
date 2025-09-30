import { sales } from "../models/sale.model.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { sendNotification } from "../utils/sendNotification.js";
import { userModel as User } from "../models/user.model.js";

// function for add new sale

export const addSale = async (req, res) => {
  const { heading, subHeading, description, type, budget } = req.body;
  const { Department, _id: employeeId, FirstName, LastName } = req.user;

  //  Department check
  if (Department !== "SALES") {
    return res.json({
      success: false,
      message: "Only for Sales department",
    });
  }

  try {
    //  Field validation
    if (!heading || !subHeading || !description || !type || !budget) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    let docs = [];

    //  Upload all chosen files to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadOnCloudinary(file.path, "HRMS_SALES_FILES")
        )
      );

      docs = uploads
        .filter((u) => u.success)
        .map((u) => ({
          public_id: u.response.public_id,
          secure_url: u.response.secure_url,
        }));
    }

    //  Create new sale entry
    const newSale = await sales.create({
      heading,
      subHeading,
      description,
      type,
      budget,
      docs,
      employee: employeeId,
    });

    if (!newSale) {
      return res.json({
        success: false,
        message: "Error while creating new sale entry",
      });
    }

    //  Notify ADMIN users about new sale
    const admins = await User.find({ Role: "ADMIN" }, "_id");
    const adminIds = admins.map((a) => a._id.toString());

    await sendNotification({
      recipients: adminIds,
      title: "New Sale Entry",
      message: `${FirstName} ${LastName} created a new sales task: "${heading}" with a budget of ${budget}.`,
      data: {
        saleId: newSale._id,
        type,
        budget,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      newSale,
    });
  } catch (error) {
    //  Rollback: delete uploaded files if DB fails
    if (docs.length > 0) {
      await Promise.all(docs.map((c) => deleteFromCloudinary(c.public_id)));
    }

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// function to get all sales data --->protected
const getSales = async (req, res) => {
  const { Department, Role } = req.user;

  //  check if user belong to SALES department
  if (Department !== "SALES" && Role !== "ADMIN") {
    return res.json({
      success: false,
      message: "Only for Sales department ",
    });
  }
  try {
    const allSales = await sales
      .find()
      .populate("employee", "FirstName LastName Email ")
      .sort({ createdAt: -1 }); // sort the sale --> newest first

    res.json({
      success: true,
      count: allSales.length,
      sales: allSales,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { addSale, getSales };
