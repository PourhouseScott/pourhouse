import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/utils/appError";

const { findById, verifyToken, MockUserRepository } = vi.hoisted(() => {
  const findById = vi.fn();
  const verifyToken = vi.fn();

  class MockUserRepository {
    findById = findById;
  }

  return {
    findById,
    verifyToken,
    MockUserRepository
  };
});

vi.mock("@/repositories/user/UserRepository", () => ({
  UserRepository: MockUserRepository
}));

vi.mock("@/utils/jwt", () => ({
  verifyToken
}));

import { adminAuthMiddleware } from "@/middleware/adminAuthMiddleware";

describe("adminAuthMiddleware", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => { });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws unauthorized when authorization header is missing", async () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: {}
    } as unknown as Request;

    const next = vi.fn() as NextFunction;

    await expect(adminAuthMiddleware(req, {} as Response, next)).rejects.toEqual(
      new AppError("Unauthorized", 401)
    );
    expect(next).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "Admin access denied",
      expect.objectContaining({ reason: "missing_header" })
    );
  });

  it("throws unauthorized when token cannot be verified", async () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: { authorization: "Bearer invalid" }
    } as unknown as Request;

    verifyToken.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await expect(adminAuthMiddleware(req, {} as Response, vi.fn())).rejects.toEqual(
      new AppError("Unauthorized", 401)
    );

    expect(console.warn).toHaveBeenCalledWith(
      "Admin access denied",
      expect.objectContaining({ reason: "invalid_token" })
    );
  });

  it("throws unauthorized when user is missing or not admin", async () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: { authorization: "Bearer good-token" }
    } as unknown as Request;

    verifyToken.mockReturnValue({
      userId: "user-1",
      email: "user@example.com",
      role: "USER"
    });
    findById.mockResolvedValue({
      id: "user-1",
      role: "USER"
    });

    await expect(adminAuthMiddleware(req, {} as Response, vi.fn())).rejects.toEqual(
      new AppError("Unauthorized", 401)
    );

    expect(console.warn).toHaveBeenCalledWith(
      "Admin access denied",
      expect.objectContaining({ reason: "invalid_role" })
    );
  });

  it("calls next when jwt is valid and user has admin role", async () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: { authorization: "Bearer good-token" }
    } as unknown as Request;

    verifyToken.mockReturnValue({
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN"
    });
    findById.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN"
    });

    const next = vi.fn() as NextFunction;

    await adminAuthMiddleware(req, {} as Response, next);

    expect(req.user).toEqual({
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN"
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
