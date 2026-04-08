import type { Prisma, User } from "@prisma/client";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleSubject(googleSubject: string): Promise<User | null>;
  updateGoogleIdentityById(input: {
    userId: string;
    googleSubject: string;
    name: string;
  }): Promise<User>;
  updateRoleByEmail(input: {
    email: string;
    role: "USER" | "ADMIN";
  }): Promise<User>;
  create(input: Prisma.UserCreateInput): Promise<User>;
}
