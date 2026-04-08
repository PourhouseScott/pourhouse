import type { PrismaClient, Prisma } from "@prisma/client";
import type { IUserRepository } from "@/repositories/user/IUserRepository";

export class UserRepository implements IUserRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  public async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public async findByGoogleSubject(googleSubject: string) {
    return this.prisma.user.findUnique({ where: { googleSubject } });
  }

  public async updateGoogleIdentityById(input: {
    userId: string;
    googleSubject: string;
    name: string;
  }) {
    return this.prisma.user.update({
      where: { id: input.userId },
      data: {
        googleSubject: input.googleSubject,
        authProvider: "GOOGLE",
        name: input.name
      }
    });
  }

  public async updateRoleByEmail(input: {
    email: string;
    role: "USER" | "ADMIN";
  }) {
    return this.prisma.user.update({
      where: { email: input.email },
      data: { role: input.role }
    });
  }

  public async create(input: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data: input });
  }
}
