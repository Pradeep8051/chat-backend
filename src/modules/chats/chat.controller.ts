import type { Request, Response, NextFunction } from "express";
import { chatService } from "./chat.service";
import { sendSuccess } from "../../utils/response";
import type { CreateChatInput } from "./chat.schemas";

export const chatController = {
  async createOrGet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userAId, userBId } = req.body as CreateChatInput;
      sendSuccess(res, { chatId: await chatService.createOrGetChat(userAId, userBId) });
    } catch (error) {
      next(error);
    }
  },
};