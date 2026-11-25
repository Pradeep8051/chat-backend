import { z } from "zod";

export const userIdParamSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
});

export const chatIdParamSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
});

export const createChatSchema = z.object({
  userAId: z.string().uuid("userAId must be a valid UUID"),
  userBId: z.string().uuid("userBId must be a valid UUID"),
});

export const chatIdAndMessageIdParamSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
  messageId: z.string().min(1, "messageId is required"),
});

export const sendMessageSchema = z.object({
  senderId: z.string().uuid("senderId must be a valid UUID"),
  text: z.string().trim().min(1, "text must not be empty").max(4000, "text is too long"),
});

export const markReadSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
});

export const lastSeenSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
  messageId: z.string().min(1, "messageId is required"),
});

export const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional().default(50),
  before: z.string().optional(),
  userId: z.string().uuid("userId must be a valid UUID").optional(),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type LastSeenInput = z.infer<typeof lastSeenSchema>;
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;