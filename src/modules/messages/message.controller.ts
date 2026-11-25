import type { Request, Response, NextFunction } from "express";
import { messageService } from "./message.service";
import { chatService } from "../chats/chat.service";
import { sendSuccess } from "../../utils/response";
import type { GetMessagesQuery, SendMessageInput } from "../chats/chat.schemas";

export const messageController = {
  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chatId } = req.params;
      const { senderId, text } = req.body as SendMessageInput;
      const message = await messageService.sendMessage(chatId, senderId, text);
      sendSuccess(res, { message: "Message sent successfully", data: message }, 201);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chatId } = req.params;
      const query = req.query as unknown as GetMessagesQuery;
      if (query.userId) await chatService.assertMembership(chatId, query.userId);
      else await chatService.getChatOrThrow(chatId);
      sendSuccess(res, { data: await messageService.listMessages(chatId, query.limit, query.before) });
    } catch (error) {
      next(error);
    }
  },
};