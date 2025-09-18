import { Server } from "socket.io";

export let io;

export const initiateServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("connected to socket", socket.id);

    socket.on("register", (userId) => {
      socket.userId = userId;
      console.log(`User ${userId} registered with ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
    });
  });
};
