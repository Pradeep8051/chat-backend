
import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import {
  registerSocketHandlers,
  type TypedServer,
  type TypedSocket,
} from "./socket.handlers";

let ioInstance: TypedServer | null = null;

export function initSocketServer(httpServer: HttpServer): TypedServer {
  if (ioInstance) return ioInstance;

  const io: TypedServer = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.on("connection", (socket: TypedSocket) => {
    registerSocketHandlers(io, socket);
  });

  ioInstance = io;
  return io;
}

export function getSocketServer(): TypedServer {
  if (!ioInstance) {
    throw new Error("Socket.IO server has not been initialized");
  }

  return ioInstance;
}

export async function closeSocketServer(): Promise<void> {
  if (ioInstance) {
    await ioInstance.close();
    ioInstance = null;
  }
}
