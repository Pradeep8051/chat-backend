import { userRepository } from "./user.repository";
import { NotFoundError } from "../../utils/errors";
import type { User } from "@prisma/client";

export const userService = {
  async getUserOrThrow(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError(`User ${userId} not found`);
    return user;
  },

  async ensureUsersExist(userIds: string[]): Promise<User[]> {
    const users = await userRepository.findByIds(userIds);
    if (users.length !== new Set(userIds).size) {
      const found = new Set(users.map((u) => u.id));
      const missing = userIds.filter((id) => !found.has(id));
      throw new NotFoundError(`User(s) not found: ${missing.join(", ")}`);
    }
    return users;
  },

  createUser: (name: string, email: string): Promise<User> =>
    userRepository.create({ name, email }),

  listUsers: (): Promise<User[]> => userRepository.list(),
};