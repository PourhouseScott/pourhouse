import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IUserRepository } from "@/repositories/user/IUserRepository";
import { AuthService } from "@/services/authService";
import { AppError } from "@/utils/appError";

function createService() {
  const userRepository: IUserRepository = {
    findByEmail: vi.fn(),
    create: vi.fn()
  };

  return {
    service: new AuthService(userRepository),
    userRepository
  };
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a new user", async () => {
    const { service, userRepository } = createService();
    const createdAt = new Date("2026-01-01T00:00:00.000Z");

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockImplementation(async (data) => ({
      id: "user-1",
      email: data.email,
      name: data.name,
      password: data.password,
      createdAt,
      ratings: []
    }) as never);

    const result = await service.registerUser({
      email: "user@example.com",
      password: "plaintext-password",
      name: "User"
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      createdAt
    });

    const createCall = vi.mocked(userRepository.create).mock.calls[0];

    if (!createCall) {
      throw new Error("Expected create to be called");
    }

    const createArg = createCall[0];
    expect(createArg.password).not.toBe("plaintext-password");
    await expect(bcrypt.compare("plaintext-password", createArg.password)).resolves.toBe(true);
  });

  it("throws when registering with existing email", async () => {
    const { service, userRepository } = createService();

    vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: "existing" } as never);

    await expect(
      service.registerUser({
        email: "user@example.com",
        password: "plaintext-password",
        name: "User"
      })
    ).rejects.toEqual(new AppError("Email already in use", 409));
  });

  it("logs in with valid credentials", async () => {
    const { service, userRepository } = createService();
    const password = "valid-password";
    const hashed = await bcrypt.hash(password, 10);
    const createdAt = new Date("2026-01-01T00:00:00.000Z");

    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: hashed,
      name: "User",
      createdAt,
      ratings: []
    } as never);

    const result = await service.loginUser({ email: "user@example.com", password });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      createdAt
    });
  });

  it("throws on login when user does not exist", async () => {
    const { service, userRepository } = createService();

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      service.loginUser({ email: "missing@example.com", password: "x" })
    ).rejects.toEqual(new AppError("Invalid credentials", 401));
  });

  it("throws on login when password is invalid", async () => {
    const { service, userRepository } = createService();
    const hashed = await bcrypt.hash("different-password", 10);

    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: hashed,
      name: "User",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      ratings: []
    } as never);

    await expect(
      service.loginUser({ email: "user@example.com", password: "wrong-password" })
    ).rejects.toEqual(new AppError("Invalid credentials", 401));
  });
});
