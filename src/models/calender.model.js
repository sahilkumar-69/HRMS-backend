import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Embedded schema for emergency contact, address, etc.
const calenderSchema = new Schema({
  date: {
    type: String,
    require: true,
  },
  event: String,
});

export const calenderModel = model("calenderModels", calenderSchema);
