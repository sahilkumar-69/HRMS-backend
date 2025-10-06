import { Server } from "socket.io";
import { Notification } from "../models/notification.model.js";
import { userModel } from "../models/User.model.js";

export let io;

let onlineUsers = new Map();

export const initiateServer = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("connected to socket", socket.id);

    socket.on("register", async ({ userId, Role }) => {
      const alreadyOnline = onlineUsers.has(userId);

      const userDetail = await userModel
        .findById(userId)
        .select("FirstName LastName");

      // Track the socket for this user
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId);
      socket.join(Role);

      console.log(`User ${userId} registered with ${socket.id}`);

      // Only notify others if this is a *new online user*
      if (!alreadyOnline) {
        io.emit("userOnline", { userId, userDetail });
      }

      // Send pending (unread) notifications only to this socket
      const pending = await Notification.find({
        recipient: userId,
        isRead: false,
      }).sort({ createdAt: -1 });

      if (pending.length > 0) {
        socket.emit("pendingNotifications", pending);
      }
    });

    socket.on("disconnect", () => {
      let userId;
      for (let [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          userId = key;
          onlineUsers.delete(key);
          break;
        }
      }

      if (userId) {
        //  Notify all clients this user is offline
        io.emit("userOffline", { userId });
      }

      console.log("user disconnected", socket.id);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io is not initialized");
  return io;
};
