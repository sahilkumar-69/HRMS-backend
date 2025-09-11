import { Schema, model } from "mongoose";

const EmergencyContactSchema = new Schema({
  Name: { type: String, required: true },
  Relationship: { type: String, required: true },
  Phone: { type: String, required: true },
});

export const emergencyContactModel = model(
  "emergencyContacts",
  EmergencyContactSchema
);
