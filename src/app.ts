
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import chatRoutes from "./modules/chats/chat.routes";
import messageRoutes from "./modules/messages/message.routes";
import userRoutes from "./modules/users/user.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { sendSuccess } from "./utils/response";

export function createApp(): Express {
  const app = express();

  const corsOptions: cors.CorsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => sendSuccess(res, { message: "OK" }));

  app.use("/chat", chatRoutes);
  app.use("/chat", messageRoutes);
  app.use("/user", userRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
