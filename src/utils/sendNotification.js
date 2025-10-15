import { getIo } from "../utils/socketIO.js";
import { Notification } from "../models/notification.model.js";

export const sendNotification = async ({
  recipients,
  title,
  message,
  type,
  data,
}) => {
  const io = getIo();

  if (!Array.isArray(recipients)) recipients = [recipients];

  // Save in DB
  const saved = await Notification.insertMany(
    recipients.map((recipient) => ({
      recipient,
      title,
      type,
      message,
      data,
    }))
  );

  // Emit real-time
  io.to(recipients.map((id) => id.toString())).emit("notification", saved);
};
