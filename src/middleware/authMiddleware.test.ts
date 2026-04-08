import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authMiddleware } from "@/middleware/authMiddleware";
import { AppError } from "@/utils/appError";
import * as jwtUtils from "@/utils/jwt";

describe("authMiddleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when authorization header is missing", () => {
    const req = { headers: {} } as Request;
    const next = vi.fn() as NextFunction;

    expect(() => authMiddleware(req, {} as Response, next)).toThrowError(
      new AppError("Missing or invalid authorization header", 401)
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws when authorization header is not a bearer token", () => {
    const req = { headers: { authorization: "Basic abc" } } as unknown as Request;

    expect(() => authMiddleware(req, {} as Response, vi.fn())).toThrowError(
      new AppError("Missing or invalid authorization header", 401)
    );
  });

  it("sets req.user from the verified jwt payload", () => {
    const req = { headers: { authorization: "Bearer token-123" } } as unknown as Request;
    const next = vi.fn() as NextFunction;

    vi.spyOn(jwtUtils, "verifyToken").mockReturnValue({
      userId: "user-1",
      email: "user@example.com",
      role: "USER"
    });

    authMiddleware(req, {} as Response, next);

    expect(jwtUtils.verifyToken).toHaveBeenCalledWith("token-123");
    expect(req.user).toEqual({
      id: "user-1",
      email: "user@example.com",
      role: "USER"
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
