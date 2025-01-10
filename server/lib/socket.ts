import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { User } from "@db/schema";

export interface ServerToClientEvents {
  message: (message: any) => void;
  channelJoined: (channel: string) => void;
  userPresence: (userId: number, status: boolean) => void;
  typing: (data: { channelId: number; user: User }) => void;
}

export interface ClientToServerEvents {
  joinChannel: (channelId: number) => void;
  leaveChannel: (channelId: number) => void;
  sendMessage: (message: any) => void;
  typing: (data: { channelId: number; user: User }) => void;
}

export function setupWebSocketServer(httpServer: Server) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("joinChannel", (channelId) => {
      socket.join(`channel:${channelId}`);
      socket.emit("channelJoined", `channel:${channelId}`);
    });

    socket.on("leaveChannel", (channelId) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on("sendMessage", (message) => {
      io.to(`channel:${message.channelId}`).emit("message", message);
    });

    socket.on("typing", (data) => {
      socket.to(`channel:${data.channelId}`).emit("typing", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
}
