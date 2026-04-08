import { describe, expect, it, vi } from "vitest";
import { UserRepository } from "@/repositories/user/UserRepository";

describe("UserRepository", () => {
  it("findById queries the user by id", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      user: {
        findUnique
      }
    } as never;

    const repository = new UserRepository(prisma);

    await repository.findById("user-1");

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" }
    });
  });

  it("findByEmail queries the user by email", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      user: {
        findUnique
      }
    } as never;

    const repository = new UserRepository(prisma);

    await repository.findByEmail("user@example.com");

    expect(findUnique).toHaveBeenCalledWith({
      where: { email: "user@example.com" }
    });
  });

  it("findByGoogleSubject queries the user by Google subject", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      user: {
        findUnique
      }
    } as never;

    const repository = new UserRepository(prisma);

    await repository.findByGoogleSubject("google-subject-1");

    expect(findUnique).toHaveBeenCalledWith({
      where: { googleSubject: "google-subject-1" }
    });
  });

  it("updateGoogleIdentityById updates Google identity fields", async () => {
    const update = vi.fn().mockResolvedValue(null);
    const prisma = {
      user: {
        update
      }
    } as never;

    const repository = new UserRepository(prisma);

    await repository.updateGoogleIdentityById({
      userId: "user-1",
      googleSubject: "google-subject-1",
      name: "Updated Name"
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        googleSubject: "google-subject-1",
        authProvider: "GOOGLE",
        name: "Updated Name"
      }
    });
  });

  it("updateRoleByEmail updates the user's role", async () => {
    const update = vi.fn().mockResolvedValue(null);
    const prisma = {
      user: {
        update
      }
    } as never;

    const repository = new UserRepository(prisma);

    await repository.updateRoleByEmail({
      email: "admin@example.com",
      role: "ADMIN"
    });

    expect(update).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      data: { role: "ADMIN" }
    });
  });

  it("create forwards the user input", async () => {
    const create = vi.fn().mockResolvedValue(null);
    const prisma = {
      user: {
        create
      }
    } as never;

    const repository = new UserRepository(prisma);
    const input = {
      email: "user@example.com",
      password: "hashed-password",
      name: "User"
    };

    await repository.create(input);

    expect(create).toHaveBeenCalledWith({ data: input });
  });
});
