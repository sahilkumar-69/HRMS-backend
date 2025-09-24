import { sales } from "../models/sale.model.js";
import uploadOnCloudinary, {
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";

// function for add new sale
const addSale = async (req, res) => {
  const { heading, subHeading, description, type, budget } = req.body;

  const { Department, _id } = req.user;

  if (Department !== "SALES") {
    return res.json({
      success: false,
      message: "Only for Sales department ",
    });
  }

  try {
    // check if all fields present
    if (!heading || !subHeading || !description || !type || !budget) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    var docs = [];

    // if file choosen, upload them to cloudinary
    if (req.files && req.files.length > 0) {
      // Wait for all uploads in parallel
      const uploads = await Promise.all(
        req.files.map(async (file) =>
          uploadOnCloudinary(file.path, "HRMS_SALES_FILES")
        )
      );

      // Filter successful uploads
      docs = uploads
        .filter((u) => u.success)
        .map((u) => ({
          public_id: u.response.public_id,
          secure_url: u.response.secure_url,
        }));
    }

    // create entry in sale model
    const newSale = await sales.create({
      heading,
      subHeading,
      description,
      type,
      budget,
      docs,
      employee: _id,
    });

    if (!newSale) {
      return res.json({
        success: false,
        message: "Error while create new sale entry",
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      newSale,
    });
  } catch (error) {
    // in case any error, delete docs from cloudinary, so that untracked files don't left on server
    await Promise.all(
      docs.map(async (cloudObj) => deleteFromCloudinary(cloudObj.public_id))
    );

    res.json({
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
