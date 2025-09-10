import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (tempLink, folder_name) => {
  try {
    const response = await cloudinary.uploader.upload(tempLink, {
      folder: folder_name || "HRMS_BACKEND_PROFILE_PHOTOS",
      resource_type: "auto",
      timeout: 10000,
    });
    fs.unlinkSync(tempLink);

    return { response, success: true };
  } catch (error) {
    console.log(error);
    fs.unlinkSync(tempLink);
    return { message: error.message, success: false };
  }
};

export const deleteFromCloudinary = async (public_id) => {
  try {
    const deletePhoto = await cloudinary.uploader.destroy(public_id);
    console.log("deleteBrochure ", deletePhoto);
    return {
      message: "Deleted from cloudinary",
      success: true,
    };
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return {
      message: "Can't delete from cloudinary",
      success: false,
    };
  }
};

export default uploadOnCloudinary;
