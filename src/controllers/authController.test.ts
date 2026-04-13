import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AuthController } from "@/controllers/authController";
import type { AuthService } from "@/services/authService";

vi.mock("@/config/env", () => ({
  env: {
    GOOGLE_CLIENT_ID: "google-client-id-test",
    GOOGLE_REDIRECT_URI: "http://localhost:8080/api/auth/google/callback"
  }
}));

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    redirect: vi.fn()
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);

  return res;
}

describe("AuthController", () => {
  it("startGoogleSignIn redirects to Google authorization URL", async () => {
    const authService = {
      authenticateWithGoogle: vi.fn()
    } as unknown as AuthService;

    const controller = new AuthController(authService);
    const req = { query: { returnTo: "/admin/wines" } } as unknown as Request;
    const res = createResponse();

    await controller.startGoogleSignIn(req, res);

    const [statusCode, redirectUrl] = vi.mocked(res.redirect).mock.calls[0] || [];
    expect(statusCode).toBe(302);
    expect(redirectUrl).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    expect(redirectUrl).toContain("client_id=google-client-id-test");
    expect(redirectUrl).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fauth%2Fgoogle%2Fcallback");
    expect(redirectUrl).toContain("scope=openid+email+profile");
    expect(redirectUrl).toContain("state=L2FkbWluL3dpbmVz");
  });

  it("startGoogleSignIn sanitizes invalid returnTo values", async () => {
    const authService = {
      authenticateWithGoogle: vi.fn()
    } as unknown as AuthService;

    const controller = new AuthController(authService);
    const req = { query: { returnTo: "https://evil.example/path" } } as unknown as Request;
    const res = createResponse();

    await controller.startGoogleSignIn(req, res);

    const [, redirectUrl] = vi.mocked(res.redirect).mock.calls[0] || [];
    expect(redirectUrl).toContain("state=L2FkbWluL3dpbmVz");
  });

  it("startGoogleSignIn defaults returnTo when query value is missing", async () => {
    const authService = {
      authenticateWithGoogle: vi.fn()
    } as unknown as AuthService;

    const controller = new AuthController(authService);
    const req = { query: {} } as unknown as Request;
    const res = createResponse();

    await controller.startGoogleSignIn(req, res);

    const [, redirectUrl] = vi.mocked(res.redirect).mock.calls[0] || [];
    expect(redirectUrl).toContain("state=L2FkbWluL3dpbmVz");
  });

  it("handleGoogleCallback redirects with app token hash on success", async () => {
    const authService = {
      authenticateWithGoogle: vi.fn()
    } as unknown as AuthService;

    vi.mocked(authService.authenticateWithGoogle).mockResolvedValue({
      token: "token-value",
      user: {
        id: "u",
        email: "u@example.com",
        name: "User",
        createdAt: new Date("2026-01-01T00:00:00.000Z")
      }
    });

    const controller = new AuthController(authService);
    const req = {
      query: {
        code: "auth-code",
        state: "L2FkbWluL3dpbmVz"
      }
    } as unknown as Request;
    const res = createResponse();

    await controller.handleGoogleCallback(req, res);

    expect(authService.authenticateWithGoogle).toHaveBeenCalledWith({
      authorizationCode: "auth-code",
      redirectUri: "http://localhost:8080/api/auth/google/callback"
    });
    expect(res.redirect).toHaveBeenCalledWith(302, "/admin/wines#token=token-value");
  });

  it("handleGoogleCallback redirects with missing code error", async () => {
    const authService = {
      authenticateWithGoogle: vi.fn()
    } as unknown as AuthService;

    const controller = new AuthController(authService);
    const req = {
      query: {
        state: "L2FkbWluL3dpbmVz"
      }
    } as unknown as Request;
    const res = createResponse();

    await controller.handleGoogleCallback(req, res);

    expect(authService.authenticateWithGoogle).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(302, "/admin/wines?authError=missing_code");
  });

  it("handleGoogleCallback redirects with auth failure error", async () => {
    const authService = {
      authenticateWithGoogle: vi.fn()
    } as unknown as AuthService;

    vi.mocked(authService.authenticateWithGoogle).mockRejectedValue(new Error("failed"));

    const controller = new AuthController(authService);
    const req = {
      query: {
        code: "auth-code"
      }
    } as unknown as Request;
    const res = createResponse();

    await controller.handleGoogleCallback(req, res);

    expect(res.redirect).toHaveBeenCalledWith(302, "/admin/wines?authError=google_auth_failed");
  });

  it("authenticateWithGoogle returns 200 with payload", async () => {
    const authService = {
      authenticateWithGoogle: vi.fn()
    } as unknown as AuthService;

    vi.mocked(authService.authenticateWithGoogle).mockResolvedValue({
      token: "t",
      user: {
        id: "u",
        email: "u@example.com",
        name: "User",
        createdAt: new Date("2026-01-01T00:00:00.000Z")
      }
    });

    const controller = new AuthController(authService);
    const req = { body: { authorizationCode: "auth-code" } } as Request;
    const res = createResponse();

    await controller.authenticateWithGoogle(req, res);

    expect(authService.authenticateWithGoogle).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "t",
      user: {
        id: "u",
        email: "u@example.com",
        name: "User",
        createdAt: new Date("2026-01-01T00:00:00.000Z")
      }
    });
  });
});
