
import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { chatService } from "../chats/chat.service";
import { sendSuccess } from "../../utils/response";

export const userController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, { data: await userService.listUsers() });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, { data: await userService.getUserOrThrow(req.params.userId) });
    } catch (error) {
      next(error);
    }
  },

  // GET /user/:userId/chats
  async listChats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const chats = await chatService.listUserChats(userId);
      sendSuccess(res, { data: chats });
    } catch (error) {
      next(error);
    }
  },
};
