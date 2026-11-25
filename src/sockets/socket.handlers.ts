import type { Server, Socket } from "socket.io";
import { ZodError, type ZodSchema } from "zod";
import { chatService } from "../modules/chats/chat.service";
import { messageService } from "../modules/messages/message.service";
import { receiptService } from "../modules/receipts/receipt.service";
import { userService } from "../modules/users/user.service";
import { AppError } from "../utils/errors";
import {
  SOCKET_EVENTS,
  joinChatSchema,
  markMessageReadSchema,
  sendMessageSchema,
  updateLastSeenSchema,
} from "./socket.events";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socket.types";

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

function emitError(socket: TypedSocket, error: unknown): void {
  if (error instanceof ZodError) {
    socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
      code: "VALIDATION_ERROR",
      message: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    });
    return;
  }
  if (error instanceof AppError) {
    socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { code: error.code, message: error.message });
    return;
  }
  socket.emit(SOCKET_EVENTS.SOCKET_ERROR, {
    code: "INTERNAL_ERROR",
    message: error instanceof Error ? error.message : "Unexpected socket error",
  });
}

function parseOrThrow<T>(schema: ZodSchema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) throw result.error;
  return result.data;
}

export function registerSocketHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(SOCKET_EVENTS.JOIN_CHAT, async (payload) => {
    try {
      const { chatId, userId } = parseOrThrow(joinChatSchema, payload);
      await userService.getUserOrThrow(userId);
      await chatService.assertMembership(chatId, userId);
      await socket.join(chatId);
      socket.data.userId = userId;
      socket.emit(SOCKET_EVENTS.JOINED_CHAT, { success: true, chatId });
    } catch (error) {
      emitError(socket, error);
      socket.emit(SOCKET_EVENTS.JOINED_CHAT, {
        success: false,
        message: error instanceof Error ? error.message : "Failed to join chat",
        code: error instanceof AppError ? error.code : "JOIN_FAILED",
      });
    }
  });

  socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload) => {
    try {
      const { chatId, senderId, text } = parseOrThrow(sendMessageSchema, payload);
      const saved = await messageService.sendMessage(chatId, senderId, text);
      io.to(chatId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, saved);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.MARK_MESSAGE_READ, async (payload) => {
    try {
      const { chatId, messageId, userId } = parseOrThrow(markMessageReadSchema, payload);
      const receipt = await receiptService.markMessageRead(chatId, messageId, userId);
      io.to(chatId).emit(SOCKET_EVENTS.MESSAGE_READ, receipt);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.UPDATE_LAST_SEEN, async (payload) => {
    try {
      const { chatId, userId, messageId } = parseOrThrow(updateLastSeenSchema, payload);
      const lastSeen = await receiptService.updateLastSeen(chatId, userId, messageId);
      io.to(chatId).emit(SOCKET_EVENTS.LAST_SEEN_UPDATED, lastSeen);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    socket.data.userId = undefined;
  });
}