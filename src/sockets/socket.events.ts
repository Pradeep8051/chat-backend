import { z } from "zod";

export const joinChatSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
  userId: z.string().uuid("userId must be a valid UUID"),
});

export const sendMessageSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
  senderId: z.string().uuid("senderId must be a valid UUID"),
  text: z.string().trim().min(1, "text must not be empty").max(4000, "text is too long"),
});

export const markMessageReadSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
  messageId: z.string().min(1, "messageId is required"),
  userId: z.string().uuid("userId must be a valid UUID"),
});

export const updateLastSeenSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
  userId: z.string().uuid("userId must be a valid UUID"),
  messageId: z.string().min(1, "messageId is required"),
});

export const SOCKET_EVENTS = {
  JOIN_CHAT: "join_chat",
  JOINED_CHAT: "joined_chat",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  MARK_MESSAGE_READ: "mark_message_read",
  MESSAGE_READ: "message_read",
  UPDATE_LAST_SEEN: "update_last_seen",
  LAST_SEEN_UPDATED: "last_seen_updated",
  SOCKET_ERROR: "socket_error",
  DISCONNECT: "disconnect",
} as const;