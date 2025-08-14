import { userModel } from "../models/user.model.js";

export const isUserExists = async (Email) => {
  try {
    const user = await userModel.findOne({ Email });

    return user || false;
  } catch (error) {
    console.log("Database error", error.message);
    throw error;
  }
};
