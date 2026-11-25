import { chatRepository, type ChatWithMembers } from "./chat.repository";
import { userService } from "../users/user.service";
import { ForbiddenError, NotFoundError, ValidationError } from "../../utils/errors";

export interface ChatSummary {
  chatId: string;
  members: string[];
  createdAt: string;
}

export const chatService = {
  async createOrGetChat(userAId: string, userBId: string): Promise<string> {
    if (userAId === userBId) {
      throw new ValidationError("userAId and userBId must be different users");
    }
    await userService.ensureUsersExist([userAId, userBId]);

    const existing = await chatRepository.findDirectChat(userAId, userBId);
    if (existing) return existing.id;

    const created = await chatRepository.createDirectChat(userAId, userBId);
    return created.id;
  },

  async getChatOrThrow(chatId: string): Promise<ChatWithMembers> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw new NotFoundError(`Chat ${chatId} not found`);
    return chat;
  },

  async assertMembership(chatId: string, userId: string): Promise<ChatWithMembers> {
    const chat = await this.getChatOrThrow(chatId);
    if (!chat.members.some((m) => m.userId === userId)) {
      throw new ForbiddenError(`User ${userId} does not belong to chat ${chatId}`);
    }
    return chat;
  },

  async listUserChats(userId: string): Promise<ChatSummary[]> {
    await userService.getUserOrThrow(userId);
    const chats = await chatRepository.listChatsForUser(userId);
    return chats.map((chat) => ({
      chatId: chat.id,
      members: chat.members.map((m) => m.userId),
      createdAt: chat.createdAt.toISOString(),
    }));
  },
};