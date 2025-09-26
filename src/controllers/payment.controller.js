import Payment from "../models/payroll.model.js";
import { userModel as User } from "../models/User.model.js";

// 1. Create salary record (HR initiates)
export const createPayment = async (req, res) => {
  try {
    const {
      _id: employee,
      grossSalary,
      otherDeductions,
      month,
      year,
    } = req.body;

    const { Role } = req.user;

    if (Role !== "HR" && Role !== "ADMIN") {
      return res.json({
        success: false,
        message: "Access denied",
      });
    }
    // ensure employee exists
    const empExists = await User.findById(employee);
    if (!empExists) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // prevent duplicate salary for same month-year
    const existing = await Payment.findOne({ employee, month, year });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Salary already processed for ${month}-${year}`,
      });
    }

    const payment = await Payment.create({
      employee,
      grossSalary,
      otherDeductions,
      month,
      year,
      status: "Pending",
    });

    res
      .status(201)
      .json({ success: true, message: "Salary record created", data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// 2. Get all salary records (Admin view)
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("employee", "FirstName LastName Email Role Salary Department  ") // adjust fields as per your user schema
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// 3. Get single salary record
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate(
      "employee",
      "FirstName LastName Email Role Department"
    );

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

// 4. Update salary record (HR can edit before approval)
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment updated",
      data: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating payment",
      error: error.message,
    });
  }
};

// 5. Update salary status (Admin review → Approve / Reject / Need Correction)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const { Role } = req.user;

    if (Role !== "ADMIN")
      return res.json({
        success: false,
        message: "Only admin can access this route",
      });

    if (
      !["Pending", "Processed", "Rejected", "Need Correction", "Paid"].includes(
        status
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    payment.status = status;
    if (remarks) payment.otherDeductions.remarks = remarks;
    if (status === "Paid") payment.paymentDate = new Date();

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
};

// 6. Delete salary record (only before approval - optional)
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "Paid") {
      return res.json({ success: false, message: "Cannot edit this entry" });
    }

    res.status(200).json({ success: true, message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting payment",
      error: error.message,
    });
  }
};
