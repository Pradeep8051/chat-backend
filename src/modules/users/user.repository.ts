import { prisma } from "../../config/database";
import type { User } from "@prisma/client";

export const userRepository = {
  findById: (id: string): Promise<User | null> => prisma.user.findUnique({ where: { id } }),
  findByIds: (ids: string[]): Promise<User[]> =>
    prisma.user.findMany({ where: { id: { in: ids } } }),
  findByEmail: (email: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { email } }),
  create: (data: { name: string; email: string }): Promise<User> => prisma.user.create({ data }),
  list: (): Promise<User[]> => prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
};