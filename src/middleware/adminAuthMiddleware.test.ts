import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/utils/appError";

vi.mock("@/config/env", () => ({
  env: {
    ADMIN_API_TOKEN: "this-is-a-long-admin-token"
  }
}));

import { adminAuthMiddleware } from "@/middleware/adminAuthMiddleware";

describe("adminAuthMiddleware", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws unauthorized when authorization header is missing", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: {}
    } as unknown as Request;

    const next = vi.fn() as NextFunction;

    expect(() => adminAuthMiddleware(req, {} as Response, next)).toThrowError(
      new AppError("Unauthorized", 401)
    );
    expect(next).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "Admin access denied",
      expect.objectContaining({ reason: "missing_header" })
    );
  });

  it("throws unauthorized when authorization header is not a bearer token", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: { authorization: "Basic abc" }
    } as unknown as Request;

    expect(() => adminAuthMiddleware(req, {} as Response, vi.fn())).toThrowError(
      new AppError("Unauthorized", 401)
    );
    expect(console.warn).toHaveBeenCalledWith(
      "Admin access denied",
      expect.objectContaining({ reason: "missing_header" })
    );
  });

  it("throws unauthorized when admin token is invalid", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: { authorization: "Bearer wrong-token" }
    } as unknown as Request;

    expect(() => adminAuthMiddleware(req, {} as Response, vi.fn())).toThrowError(
      new AppError("Unauthorized", 401)
    );
    expect(console.warn).toHaveBeenCalledWith(
      "Admin access denied",
      expect.objectContaining({ reason: "invalid_token" })
    );
  });

  it("calls next when admin token is valid", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/admin/wines",
      ip: "127.0.0.1",
      headers: { authorization: "Bearer this-is-a-long-admin-token" }
    } as unknown as Request;

    const next = vi.fn() as NextFunction;

    adminAuthMiddleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
