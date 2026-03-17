import type { Prisma, User } from "@prisma/client";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(input: Prisma.UserCreateInput): Promise<User>;
}
