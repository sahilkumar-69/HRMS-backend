import { userModel } from "../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Otp from "../models/otp.model.js";

import fs from "fs";
import PDFDocument from "pdfkit";
import Number2Word from "number-to-words";
import uploadOnCloudinary, {
  deleteFromCloudinary,
  uploadPdfBufferOnCloudinary,
} from "../utils/Cloudinary.js";
import { isUserExists } from "../utils/IsUserExists.js";
import { generateToken } from "../utils/generateToken.js";
import { hashOTP } from "../utils/otp.js";
import { sendMail } from "../utils/nodemailer.js";
import { sendNotification } from "../utils/sendNotification.js";
import puppeteer from "puppeteer";
import { PaySlip } from "../models/payslip.model.js";
import { payslipHTML } from "../templates/paySlip.template.js";
import { calculateSalary } from "../utils/calculateDays.js";
// import streamifier  from 'strimi'

const userLogin = async (req, res) => {
  try {
    const { Role, Password, Email } = req.body;

    if (!Email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!Password || Password.length < 8) {
      return res.status(403).json({
        success: false,
        message: "Password is required and must be at least 8 characters",
      });
    }

    const isExists = await userModel
      .findOne({ Email })
      .populate({
        path: "Tasks",
        select:
          "title description priority startDate dueDate assignee assigner status",
        populate: [
          { path: "assignee", select: "FirstName LastName Email Role" },
          { path: "assigner", select: "FirstName LastName Email Role" },
        ],
      })
      .populate({
        path: "Tasks",
        select:
          "title description priority startDate dueDate assignee assigner status",
        populate: [
          { path: "assignee", select: "FirstName LastName Email Role" },
          { path: "assigner", select: "FirstName LastName Email Role" },
        ],
      });
    //

    if (!isExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (Role && isExists.Role !== Role) {
      return res.status(403).json({
        success: false,
        message: "No user with this role",
      });
    }

    const isPasswordMatch = await isExists.comparePassword(Password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password doesn't match",
      });
    }

    const accessToken = isExists.generateAccessToken();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: isExists,
      accessToken,
    });
  } catch (error) {
    console.error("Error in login", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const userSignUp = async (req, res) => {
  // console.log(req.body);

  const {
    FirstName,
    LastName,
    Gender,
    Email,
    Phone,
    Salary,
    Dob,
    Department,
    Designation,
    PanNumber,
    AadharNumber,
    BankName,
    AccountNumber,
    JoiningDate,
    IFSC,
    Branch,
    Role,
    Permissions,
    PermanentAddress,
    CurrentAddress,
    EmergencyPhone,
    EmergencyName,
    EmergencyRelation,
    Password,
    AllowedTabs,
  } = req.body;

  // console.log(req.body);

  if (
    [
      FirstName,
      Email,
      Phone,
      Dob,
      PermanentAddress,
      CurrentAddress,
      Department,
      Designation,
      Role,
      Gender,
      PanNumber,
      AadharNumber,
      BankName,
      AccountNumber,
      IFSC,
      Branch,

      EmergencyPhone,
      EmergencyName,
      EmergencyRelation,
      Password,
      JoiningDate,
    ].some((ele) => {
      return ele == undefined || ele == ""
        ? true
        : ele?.trim() == ""
        ? true
        : false;
    })
  ) {
    return res.status(404).json({
      success: false,
      message: "all fields are required",
    });
  }

  if (Password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password is required and min 8 character required",
    });
  }

  try {
    const isExists = await isUserExists(Email, Role);

    if (isExists) {
      return res.status(403).json({
        success: false,
        message: "Email already in use",
      });
    }

    if (!req.file || !req.file.path) {
      return res.status(404).json({
        message: "Profile Photo is not uploaded (file path missing)",
      });
    }
    const fileStr = req?.file?.path;

    var cloudRes = await uploadOnCloudinary(fileStr);

    if (!cloudRes.success) {
      cloudRes && (await deleteFromCloudinary(cloudRes.response.public_id));
      return res
        .status(400)
        .json({ message: "could not uploaded to cloudinary", success: false });
    }

    const user = new userModel({
      FirstName,
      LastName,
      Email,
      Phone,
      Dob,
      Department,
      Profile_url: cloudRes.response.secure_url,
      Profile_Public_id: cloudRes.response.public_id,
      Designation,
      Permissions,
      CurrentAddress,
      PermanentAddress,
      JoiningDate,
      Designation,
      PanNumber,
      Gender,
      AadharNumber,
      BankDetails: {
        BankName,
        AccountNumber,
        IFSC,
        Branch,
      },
      EmergencyPhone,
      Salary: Salary || null,
      EmergencyName,
      EmergencyRelation,
      Role,
      AllowedTabs,
      Password,
      // createdBy: req?.user?._id || null,
      updatedBy: req?.user?._id || null,
    });

    // console.log("before save user", user);

    var savedUser = await user.save();

    // console.log("after save user", savedUser);

    if (!savedUser) {
      cloudRes.success &&
        (await deleteFromCloudinary(cloudRes.response.public_id));

      return res.status(500).json({
        success: false,
        message: "Can't save to db",
      });
    }

    const recipientIds = await userModel.find({ Role: "HR" }).select("_id");
    console.log("recipientIds", recipientIds);

    const notificationParams = {
      recipients: recipientIds.map((id) => id._id.toString()),
      title: "New Employee joined",
      message: `New Employee named ${savedUser.FirstName} ${savedUser.LastName} joined as ${savedUser.Designation}`,
      data: "",
    };

    await sendNotification(notificationParams);

    return res.status(201).json({
      success: true,
      message: "User signup successfully",
      user: savedUser,
    });
  } catch (error) {
    // await userModel.findByIdAndDelete(savedUser?._id);
    cloudRes.success &&
      (await deleteFromCloudinary(cloudRes.response.public_id));

    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const id = req.params.id;

    // console.log("updates", id, updates);

    const userToUpdate = await userModel.findById(id);

    // console.log("usertoupdate", userToUpdate);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure HR/Owner cannot update restricted fields
    // const restricted = ["Password", "Role", "Permissions"];
    // restricted.forEach((field) => {
    //   if (updates[field]) delete updates[field];
    // });

    if (req.file && req.file.path) {
      const deleteCurrentPhoto = await deleteFromCloudinary(
        userToUpdate.Profile_Public_id
      );

      if (!deleteCurrentPhoto.success) {
        return res.status(500).json({
          message: deleteCurrentPhoto.message,
        });
      }

      const updatedURL = await uploadOnCloudinary(req.file.path);

      if (!updatedURL.success) {
        return res.status(404).json({ message: updatedURL.message });
      }

      await userModel.findByIdAndUpdate(
        userToUpdate._id,
        {
          $set: {
            Profile_url: updatedURL.response.secure_url,
            Profile_Public_id: updatedURL.response.public_id,
          },
        },
        { new: true, runValidators: true }
      );
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userToUpdate._id,
        {
          $set: {
            ...updates,
            Tasks: userToUpdate.Tasks,
            Leaves: userToUpdate.Leaves,
            PaymentHistory: userToUpdate.PaymentHistory,
            JoinedTeams: userToUpdate.JoinedTeams,
            Notifications: userToUpdate.Notifications,
            updatedBy: req.user._id,
            // createdBy: updates?.createdBy || null,
          },
        },
        { new: true, runValidators: true }
      )
      .select("-Password ");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id && id.trim()) {
      const isDeleted = await userModel.findByIdAndDelete(id);

      if (isDeleted?.Profile_Public_id)
        await deleteFromCloudinary(isDeleted.Profile_Public_id);

      if (!isDeleted) {
        return res.status(400).json({
          message: "can't delete from database",
          success: false,
        });
      }

      return res.status(200).json({
        message: "deleted",
        success: true,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

const getAllEmp = async (req, res) => {
  try {
    const Emps = await userModel
      .find()
      .select("-Password")
      .populate("Tasks", "title dueDate assigner")
      .populate("Leaves", "days leaveType reason status");
    // .populate("JoinedTeams", "title dueDate assigner")
    // .populate("Notifications", "title message isRead");

    const allEmployees = {
      HR: Emps.filter((emp) => emp.Role == "HR"),
      ADMIN: Emps.filter((emp) => emp.Role == "ADMIN"),
      TL: Emps.filter((emp) => emp.Role == "TL"),
      EMPLOYEE: Emps.filter((emp) => emp.Role == "EMPLOYEE"),
    };

    // console.log(Emps);

    return res.status(200).json({
      message: "Emp fetched",
      success: true,
      data: allEmployees,
      Emps,
    });
  } catch (error) {
    res.status(500).json({
      error,
      success: false,
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id.trim()) {
      const user = await userModel.findById(id).select("  -Token  -_id");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      return res.status(200).json({
        message: "User found",
        user,
        success: true,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: error.message,
      success: false,
    });
  }
};

const forgotPassword = async (req, res) => {
  const { Email } = req.body;

  const user = await isUserExists(Email);

  console.log("user", user);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "user not found",
    });
  }

  await sendMail(Email);

  res.status(200).json({ message: "Mail Send", success: true });
};

const updatePassword = async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    // console.log(decoded);
    if (decoded.email !== email) {
      return res.status(403).send("Token email mismatch");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.findOneAndUpdate(
      { Email: email },
      { Password: hashedPassword }
    );

    // console.log(user);

    res.send("Password has been updated successfully.");
  } catch (err) {
    console.error("Reset failed:", err.message);
    res.status(400).send("Invalid or expired token.");
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.query;
  if (!email || !otp) return res.status(400).json({ error: "Missing fields" });

  const otpHash = hashOTP(otp);

  const otpRecord = await Otp.findOne({ email, otpHash });

  if (!otpRecord)
    return res.status(401).json({ error: "Invalid or expired OTP" });

  // OTP is valid. Delete it for one-time use
  await Otp.deleteOne({ _id: otpRecord._id });

  const token = jwt.sign({ email }, process.env.SECRET_TOKEN, {
    expiresIn: "10m",
  });
  // console.log(token);
  // Proceed to show password reset form or token
  res.render("resetPassword", { email, token });
};

const generatePayslip = async (req, res) => {
  try {
    // accept JSON payload with employee info OR a payslip id param
    const payload = req.body;

    const {
      employeeId,
      AadharCardNumber,
      PANCardNumber,
      month,
      paidDays,
      unPaidDays,
      specialAllowance,
      basic,
      hra,
      tax,
      allowances,
      deductions,
    } = payload;

    // console.log("payload", req.body);
    if (
      !employeeId ||
      !employeeId.trim() ||
      !PANCardNumber ||
      !PANCardNumber.trim() ||
      !AadharCardNumber ||
      !AadharCardNumber.trim() ||
      !basic
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields", success: false });
    }

    const user = await userModel.findById(employeeId);

    // console.log("user", user);

    if (!user) {
      return res
        .status(404)
        .json({ message: "Employee not found", success: false });
    }

    const calc = calculateSalary({
      specialAllowance: Number(specialAllowance) ?? 0,
      basic: Number(basic) || 0,
      hra: Number(hra) ?? 0,
      allowances: allowances || [],
      deductions: deductions || [],
      tax: Number(tax) ?? 0,
    });

    const dataForTemplate = {
      ...payload,
      ...user,
      BASIC: calc.basic,
      HRA: calc.hra,
      ALLOWANCES: calc.allowancesTotal,
      DEDUCTIONS: calc.deductionsTotal,
      GROSS: calc.gross,
      TAX: calc.tax,
      // netPay: calc.netPay,
      MONTH: new Date(month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    };

    const { html, totalDeduction, netPay } = payslipHTML(dataForTemplate);

    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      // margin: { top: "20px", bottom: "20px" },
    });

    await browser.close();

    var updoadResult = await uploadPdfBufferOnCloudinary(
      pdfBuffer,
      user.FirstName + "_" + user.LastName,
      dataForTemplate.month
    );

    // console.log("uploadresult", updoadResult);

    if (!updoadResult) {
      return res.status(500).json({
        message: "Failed to upload PDF",
        success: false,
        error: updoadResult,
      });
    }

    const payslipRecord = await PaySlip.create({
      employeeId: user._id,
      month: month,
      payload,
      netPay: netPay,
      secure_url: updoadResult.secure_url,
      public_id: updoadResult.public_id,
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id,
    });

    if (!payslipRecord) {
      updoadResult?.public_id &&
        (await deleteFromCloudinary(updoadResult?.public_id));

      return res.status(500).json({
        message: "Failed to upload PDF",
        success: false,
        error: updoadResult,
      });
    }

    await sendNotification({
      recipients: user._id.toString(),
      title: "New Payslip Generated",
      message: `Your payslip for ${dataForTemplate.month} is now available.`,
      data: "",
    });

    res.status(200).json({
      success: true,
      message: "Payslip generated successfully",
      pdfUrl: updoadResult.secure_url,
      data: payslipRecord,
    });

    // Launch puppeteer
    // const browser = await puppeteer.launch({
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    //   headless: true,
    // });
    // const page = await browser.newPage();
    // await page.setContent(html, { waitUntil: "networkidle0" });
    // const pdfBuffer = await page.pdf({
    //   format: "A4",
    //   printBackground: true,
    //   margin: { top: "20px", bottom: "20px" },
    // });
    // await browser.close();

    // // Optionally save metadata to DB and persist file somewhere (omitted for brevity)
    // // const saved = await Payslip.create({ ...dataForTemplate, pdfPath: "s3://..." });

    // // Return PDF
    // res.set({
    //   "Content-Type": "application/pdf",
    //   "Content-Length": pdfBuffer.length,
    //   "Content-Disposition": `attachment; filename="${
    //     payload.name || "payslip"
    //   }-${dataForTemplate.month}.pdf"`,
    // });

    // return res.send(pdfBuffer);
  } catch (err) {
    updoadResult?.public_id &&
      (await deleteFromCloudinary(updoadResult?.public_id));
    console.error("Error generating payslip:", err);
    return res
      .status(500)
      .json({ message: "Failed to generate payslip", error: err.message });
  }
};

const getPaySlip = async (req, res) => {
  try {
    const { _id } = req.user;

    const payslip = await PaySlip.find({ employeeId: _id });

    console.log(payslip);

    return res.status(200).json({
      message: "Payslip fetched",
      success: true,
      payslip,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

const updatePaySlip = async (req, res) => {
  try {
  } catch (error) {}
};

const deletePaySlip = async (req, res) => {
  try {
  } catch (error) {}
};

const checkAuth = async (req, res) => {
  if (req?.user) {
    return res.status(200).json({
      success: true,
      message: "User authenticated",
      accessToken: req.user.generateAccessToken(),
      user: req.user,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalide token",
    });
  }
};

export {
  userLogin,
  userSignUp,
  updateUser,
  deleteUser,
  getUserById,
  getPaySlip,
  deletePaySlip,
  updatePaySlip,
  getAllEmp,
  checkAuth,
  forgotPassword,
  generatePayslip,
  updatePassword,
  verifyOtp,
};
