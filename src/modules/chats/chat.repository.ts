import { prisma } from "../../config/database";
import type { Chat, ChatMember, Prisma } from "@prisma/client";

export type ChatWithMembers = Chat & { members: ChatMember[] };

export const chatRepository = {
  findById: (chatId: string): Promise<ChatWithMembers | null> =>
    prisma.chat.findUnique({ where: { id: chatId }, include: { members: true } }),

  async isMember(chatId: string, userId: string): Promise<boolean> {
    const member = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    return member !== null;
  },

  async findDirectChat(userAId: string, userBId: string): Promise<ChatWithMembers | null> {
    const candidates = await prisma.chat.findMany({
      where: {
        AND: [
          { members: { some: { userId: userAId } } },
          { members: { some: { userId: userBId } } },
        ],
      },
      include: { members: true },
    });

    return (
      candidates.find((chat) => {
        const memberIds = chat.members.map((m) => m.userId).sort();
        const target = [userAId, userBId].sort();
        return memberIds.length === 2 && memberIds[0] === target[0] && memberIds[1] === target[1];
      }) ?? null
    );
  },

  createDirectChat(userAId: string, userBId: string): Promise<ChatWithMembers> {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const chat = await tx.chat.create({ data: {} });
      await tx.chatMember.createMany({
        data: [
          { chatId: chat.id, userId: userAId },
          { chatId: chat.id, userId: userBId },
        ],
      });
      return tx.chat.findUniqueOrThrow({ where: { id: chat.id }, include: { members: true } });
    });
  },

  listChatsForUser: (userId: string): Promise<ChatWithMembers[]> =>
    prisma.chat.findMany({
      where: { members: { some: { userId } } },
      include: { members: true },
      orderBy: { createdAt: "asc" },
    }),
};