import crypto from "crypto";
import OtpModel from "../models/Otp.model.js";
import { sendSMS } from "../utils/twilio.js";

// generate opt using crypto
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// controller to send otp to phone number
const getOtp = async (req, res) => {
  try {
    var { phone } = req.body;

    if (!phone)
      return res.status(404).json({
        message: "Missing Phone Number",
        success: false,
      });

    const otp = generateOtp();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpModel.findOneAndUpdate(
      { phone },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const message = `Your verification code is ${otp}. It will expire in 5 minutes. Do not share this code with anyone.`;

    await sendSMS(phone, message);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    await OtpModel.deleteOne({ phone });
    return res.status(500).json({
      message: error.message,
      error,
      success: false,
    });
  }
};
// controller to very=ify otp
const verifyOtpController = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP required" });

    const record = await OtpModel.findOne({ phone });
    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ OTP Verified
    await OtpModel.deleteOne({ phone }); // remove after verification
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying OTP", error: error.message });
  }
};

export { getOtp, verifyOtpController };
