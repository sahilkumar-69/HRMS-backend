import { userModel } from "../models/User.js";

export const isUserExists = async (Email, Role) => {
  try {
 
    const user = await userModel.findOne({ Email });

    return user || false;
  } catch (error) {
    console.log("Database error", error.message);
    throw error;
  }
};
