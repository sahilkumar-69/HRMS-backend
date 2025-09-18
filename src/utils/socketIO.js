import { Server } from "socket.io";

export let io;

const initiateServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("connected to socket", socket.id);
  });
};
