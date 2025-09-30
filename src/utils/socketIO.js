import { Server } from "socket.io";
import { Notification } from "../models/notification.model.js";

export let io;

let onlineUsers = new Map();

export const initiateServer = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("connected to socket", socket.id);

    socket.on("register", async ({ userId, Role }) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId);
      socket.join(Role);

      console.log(`User ${userId} registered with ${socket.id}`);

      //  Notify all clients this user is online
      io.emit("userOnline", { userId });

      // Send pending (unread) notifications
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
