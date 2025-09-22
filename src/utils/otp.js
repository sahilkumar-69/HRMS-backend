import crypto from "crypto";

export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString(); // 6-digit OTP
}

export function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
