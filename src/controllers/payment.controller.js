import Payment from "../models/payroll.model.js";
import { userModel as User } from "../models/User.model.js";

// 1. Create salary record (HR initiates)
import { sendNotification } from "../utils/sendNotification.js";

export const createPayment = async (req, res) => {
  try {
    const {
      _id: employee,
      grossSalary,
      otherDeductions,
      month,
      year,
    } = req.body;

    const { Role, FirstName, LastName } = req.user;

    if (Role !== "HR" && Role !== "ADMIN") {
      return res.json({
        success: false,
        message: "Access denied",
      });
    }

    //  Ensure employee exists
    const empExists = await User.findById(employee);
    if (!empExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    //  Prevent duplicate salary for same month-year
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

    //  Notify the employee
    await sendNotification({
      recipients: [employee],
      title: "Salary Processing Initiated",
      message: `Your salary for ${month}-${year} is being processed by ${FirstName} ${LastName}.`,
      data: {
        paymentId: payment._id,
        month,
        year,
        status: payment.status,
      },
    });

    //  Notify all ADMINs (if HR created it)
    if (Role === "HR") {
      const adminUsers = await User.find({ Role: "ADMIN" }, "_id");
      const adminIds = adminUsers.map((u) => u._id);

      await sendNotification({
        recipients: adminIds,
        title: "New Salary Record",
        message: `${FirstName} ${LastName} created a salary record for ${empExists.FirstName} ${empExists.LastName} for ${month}-${year}.`,
        data: { paymentId: payment._id },
      });
    }

    res.status(201).json({
      success: true,
      message: "Salary record created",
      data: payment,
    });
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

    //  Update the payment
    const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("employee", "FirstName LastName _id");

    if (!updatedPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    //  Notify the employee about the update
    await sendNotification({
      recipients: [updatedPayment.employee._id],
      title: "Salary Update",
      message: `Your salary record for ${updatedPayment.month}-${updatedPayment.year} has been updated. Current status: ${updatedPayment.status}`,
      data: {
        paymentId: updatedPayment._id,
        month: updatedPayment.month,
        year: updatedPayment.year,
        status: updatedPayment.status,
      },
    });

    //  Notify all ADMINs when a payment is updated (for audit trail)
    const adminUsers = await User.find({ Role: "ADMIN" }, "_id");
    const adminIds = adminUsers.map((u) => u._id);

    await sendNotification({
      recipients: adminIds,
      title: "Payment Record Updated",
      message: `Payment record for ${updatedPayment.employee.FirstName} ${updatedPayment.employee.LastName} (${updatedPayment.month}-${updatedPayment.year}) has been updated.`,
      data: { paymentId: updatedPayment._id },
    });

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

// 5. Update salary status (Admin review → Approve / Reject / Need Correction)import { sendNotification } from "../utils/sendNotification.js";

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const { Role, FirstName, LastName } = req.user;

    //  Only ADMIN can update payment status
    if (Role !== "ADMIN") {
      return res.json({
        success: false,
        message: "Only admin can access this route",
      });
    }

    //  Validate status
    const validStatuses = [
      "Pending",
      "Processed",
      "Rejected",
      "Need Correction",
      "Paid",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    //  Fetch payment
    const payment = await Payment.findById(id).populate(
      "employee",
      "FirstName LastName _id"
    );
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    //  Update payment fields
    payment.status = status;
    if (remarks) payment.otherDeductions.remarks = remarks;
    if (status === "Paid") payment.paymentDate = new Date();

    await payment.save();

    //  Notify the employee about status change
    await sendNotification({
      recipients: [payment.employee._id],
      title: "Salary Status Update",
      message: `Your salary for ${payment.month}-${payment.year} has been marked as ${status} by ${FirstName} ${LastName}.`,
      data: {
        paymentId: payment._id,
        status,
        remarks: remarks || null,
        month: payment.month,
        year: payment.year,
      },
    });

    //  Notify HR (if any) so they stay informed
    const hrUsers = await User.find({ Role: "HR" }, "_id");
    if (hrUsers.length) {
      await sendNotification({
        recipients: hrUsers.map((u) => u._id),
        title: "Payment Status Changed",
        message: `${FirstName} ${LastName} updated salary status for ${payment.employee.FirstName} ${payment.employee.LastName} to ${status}.`,
        data: {
          paymentId: payment._id,
          status,
          month: payment.month,
          year: payment.year,
        },
      });
    }

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
    const { Role, FirstName, LastName } = req.user;

    //  Fetch the payment
    const payment = await Payment.findById(id).populate(
      "employee",
      "FirstName LastName _id"
    );

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    //  Prevent deletion of paid entries
    if (payment.status === "Paid") {
      return res.json({
        success: false,
        message: "Cannot delete a payment that has already been paid",
      });
    }

    //  Perform deletion
    await Payment.findByIdAndDelete(id);

    //  Notify the employee
    await sendNotification({
      recipients: [payment.employee._id],
      title: "Salary Record Deleted",
      message: `Your salary record for ${payment.month}-${payment.year} has been deleted by ${FirstName} ${LastName}.`,
      data: {
        paymentId: id,
        month: payment.month,
        year: payment.year,
      },
    });

    //  Notify HR & Admins (for audit)
    const adminsAndHR = await User.find(
      { Role: { $in: ["ADMIN", "HR"] } },
      "_id"
    );
    const recipients = adminsAndHR
      .map((u) => u._id.toString())
      .filter((uid) => uid !== req.user._id.toString()); // avoid notifying the actor again

    if (recipients.length) {
      await sendNotification({
        recipients,
        title: "Payment Deleted",
        message: `${FirstName} ${LastName} deleted the salary record for ${payment.employee.FirstName} ${payment.employee.LastName} (${payment.month}-${payment.year}).`,
        data: { paymentId: id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting payment",
      error: error.message,
    });
  }
};
