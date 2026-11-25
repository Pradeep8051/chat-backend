import "dotenv/config";
import http from "http";
import { createApp } from "./app";

import { connectDatabase, disconnectDatabase } from "./config/database";
import { initSocketServer, closeSocketServer } from "./sockets/socket.server";

const PORT = Number(process.env.PORT ?? 4000);

async function bootstrap(): Promise<void> {
  await connectDatabase();
  const app = createApp();
  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`[server] HTTP + Socket.IO listening on port ${PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[server] Received ${signal}, shutting down...`);
    await closeSocketServer();
    await disconnectDatabase();
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("[server] Failed to start", error);
  process.exit(1);
});