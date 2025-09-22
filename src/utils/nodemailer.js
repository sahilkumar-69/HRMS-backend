import "dotenv/config";
import nodemailer from "nodemailer";
import Otp from "../models/otp.model.js";
import { generateOTP, hashOTP } from "./otp.js"

const otp = generateOTP();
const otpHash = hashOTP(otp);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

let otp_entry;

export const sendMail = async (to) => {
  const resetLink = `http://localhost:4343/api/reset-password/verify-otp?email=${to}&otp=${otp}`;
  try {
    otp_entry = await Otp.create({ email: to, otpHash });

    transporter.sendMail({
      from: `"HRMS Portal" <${process.env.SMTP_USER}>`,
      to,
      subject: "Reset your HRMS account password",
      text: `Your OTP is ${otp}. Or click here to reset password: ${resetLink}`,
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f6f6f6">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0">
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 6px;
              font-family: Arial, sans-serif;
              padding: 40px;
            "
          >
            <tr></tr>
            <tr>
              <td
                style="
                  font-size: 24px;
                  font-weight: bold;
                  color: #333333;
                  padding-bottom: 10px;
                "
              >
                HRMS password reset
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #333333; padding-bottom: 20px">
                Dear Employee,
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #333333; padding-bottom: 20px">
                We've received your request to reset your password. Please use the below link to reset your password
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 30px">
                
                  <p><a href="${resetLink}">Click here</a> to reset your password:</p>
              </td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #888888; padding-bottom: 10px">
                If you need additional assistance, or you did not make this
                change, please contact
                <a
                  href="mailto:help@devnexussolutions.com"
                  style="color: #f26b3a; text-decoration: none"
                  >help@devnexussolutions.com</a
                >.
              </td>
            </tr>
            <tr>
              <td
                style="
                  font-size: 11px;
                  color: #cccccc;
                  border-top: 1px solid #eeeeee;
                  padding-top: 20px;
                "
              >
                &copy; 2025 Devnexus Solutions pvt. ltd. All Rights Reserved<br />
                <a
                  href="https://www.google.com/maps/place/201+Mission+Street,+Suite+2375,+San+Francisco,+CA+94105"
                  style="color: #999999; text-decoration: none"
                >
                  26B B2 Spaze itech tower, Sector 49, Gurugram, India
                </a>
                &nbsp;|&nbsp; +91 111 111 1111
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
    });
  } catch (error) {
    if (otp_entry) Otp.findByIdAndDelete(otp_entry._id);
    console.error("Error in sending mail", error.message);
  }
};
