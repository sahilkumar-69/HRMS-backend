import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// const dbName = process.env.DB_NAME;
const URI = process.env.MONGO_URI;

export const dbConnect = async () => {
  try {
    await mongoose.connect(URI);
    console.log("connected to database");
  } catch (error) {
    console.error("Database connection failed", error.message);
    process.exit(1);
  }
};
