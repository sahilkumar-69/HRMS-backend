import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Embedded schema for emergency contact, address, etc.
const AddressSchema = new Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postalCode: { type: Number },
});

export const addressModel = model("addressModels", AddressSchema);
