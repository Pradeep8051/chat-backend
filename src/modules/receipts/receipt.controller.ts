import type { Request, Response, NextFunction } from "express";
import { receiptService } from "./receipt.service";
import { sendSuccess } from "../../utils/response";
import type { LastSeenInput, MarkReadInput } from "../chats/chat.schemas";

export const receiptController = {
  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chatId, messageId } = req.params;
      const { userId } = req.body as MarkReadInput;
      await receiptService.markMessageRead(chatId, messageId, userId);
      sendSuccess(res, { message: "Message marked as read" });
    } catch (error) {
      next(error);
    }
  },

  async updateLastSeen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chatId } = req.params;
      const { userId, messageId } = req.body as LastSeenInput;
      await receiptService.updateLastSeen(chatId, userId, messageId);
      sendSuccess(res, { message: "Last seen updated successfully" });
    } catch (error) {
      next(error);
    }
  },
};