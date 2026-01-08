import cron from "node-cron";
import LeaveModel from "../models/leave.model.js";
import { userModel } from "../models/User.model.js";
import { sendMail } from "./nodemailer.js";
import taskModel from "../models/task.model.js";
import { sendNotification } from "./sendNotification.js";

// Schedule a cron job to run at midnight on the first day of every week
// cron.schedule("* * * * *",
const notify = async () => {
  try {
    // console.log("Running monthly leave reset cron job...");
    // Fetch all users
    const Tasks = await taskModel
      .find({
        status: "todo",
        dueDate: { $gt: new Date() },
      })
      .select("assignee")
      .populate("assignee", "FirstName Email");

    const recipientIds = [];
    console.log(Tasks);
    for (const task of Tasks) {
      for (const assignee of task.assignee) {
        recipientIds.push({ _id: assignee._id, dueDate: task.dueDate });
        console.log(assignee.FirstName);
      }
    }

    const notificationParams = {
      recipients: recipientIds.map((recipient) => recipient._id.toString()),
      title: "Pending tasks",
      message: `You have some pending tasks`,
      data: "",
    };

    await sendNotification(notificationParams);

    // Reset leave balance to 12
    // user.leaveBalance = 12;
    // await user.save();
    // // Log the leave reset action
    // const leaveLog = new LeaveModel({
    //   user: user._id,
    //   days: 12,
    //   leaveType: "Leave Balance Reset",
    //   reason: "Monthly leave balance reset",
    //   status: "Approved",
    // });
    // await leaveLog.save();
    // // Send notification email to user
    // await sendEmail(
    //   user.Email,
    //   "Monthly Leave Balance Reset",
    //   `Dear ${user.Name},\n\nYour leave balance has been reset to 12 days for the new month.\n\nBest regards,\nHRMS Team`
    // );

    console.log("Monthly leave reset completed successfully.");
  } catch (error) {
    console.error("Error during monthly leave reset:", error);
  }
};
// notify();
// );
