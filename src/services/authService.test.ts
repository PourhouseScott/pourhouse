import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { IUserRepository } from "@/repositories/user/IUserRepository";
import { AuthService, GoogleAuthClient, type IGoogleAuthClient } from "@/services/authService";
import { AppError } from "@/utils/appError";

function createGoogleAuthClientMock(): IGoogleAuthClient {
  return {
    exchangeAuthorizationCode: vi.fn(),
    verifyIdToken: vi.fn()
  };
}

function createUserRepositoryMock(): IUserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByGoogleSubject: vi.fn(),
    updateGoogleIdentityById: vi.fn(),
    updateRoleByEmail: vi.fn(),
    create: vi.fn()
  };
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing user found by Google subject", async () => {
    const userRepository = createUserRepositoryMock();
    const googleAuthClient = createGoogleAuthClientMock();
    const service = new AuthService(userRepository, googleAuthClient);
    const createdAt = new Date("2026-01-01T00:00:00.000Z");

    vi.mocked(googleAuthClient.exchangeAuthorizationCode).mockResolvedValue({ idToken: "id-token" });
    vi.mocked(googleAuthClient.verifyIdToken).mockResolvedValue({
      googleSubject: "google-sub-1",
      email: "user@example.com",
      name: "User"
    });
    vi.mocked(userRepository.findByGoogleSubject).mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      password: null,
      name: "User",
      authProvider: "GOOGLE",
      role: "ADMIN",
      googleSubject: "google-sub-1",
      createdAt,
      ratings: []
    } as never);

    const result = await service.authenticateWithGoogle({ authorizationCode: "auth-code" });

    expect(googleAuthClient.exchangeAuthorizationCode).toHaveBeenCalledWith({
      authorizationCode: "auth-code",
      redirectUri: "http://localhost:4000/auth/google/callback"
    });
    expect(result.user).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      createdAt
    });
    expect(result.token).toEqual(expect.any(String));
  });

  it("links existing email user to Google identity", async () => {
    const userRepository = createUserRepositoryMock();
    const googleAuthClient = createGoogleAuthClientMock();
    const service = new AuthService(userRepository, googleAuthClient);
    const createdAt = new Date("2026-01-01T00:00:00.000Z");

    vi.mocked(googleAuthClient.exchangeAuthorizationCode).mockResolvedValue({ idToken: "id-token" });
    vi.mocked(googleAuthClient.verifyIdToken).mockResolvedValue({
      googleSubject: "google-sub-2",
      email: "existing@example.com",
      name: "Updated Name"
    });
    vi.mocked(userRepository.findByGoogleSubject).mockResolvedValue(null);
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: "user-2",
      email: "existing@example.com",
      password: "legacy",
      name: "Old Name",
      authProvider: "LOCAL",
      role: "USER",
      googleSubject: null,
      createdAt,
      ratings: []
    } as never);
    vi.mocked(userRepository.updateGoogleIdentityById).mockResolvedValue({
      id: "user-2",
      email: "existing@example.com",
      password: "legacy",
      name: "Updated Name",
      authProvider: "GOOGLE",
      role: "USER",
      googleSubject: "google-sub-2",
      createdAt,
      ratings: []
    } as never);

    const result = await service.authenticateWithGoogle({
      authorizationCode: "auth-code",
      redirectUri: "http://localhost:4000/custom-google-callback"
    });

    expect(googleAuthClient.exchangeAuthorizationCode).toHaveBeenCalledWith({
      authorizationCode: "auth-code",
      redirectUri: "http://localhost:4000/custom-google-callback"
    });
    expect(userRepository.updateGoogleIdentityById).toHaveBeenCalledWith({
      userId: "user-2",
      googleSubject: "google-sub-2",
      name: "Updated Name"
    });
    expect(result.user).toEqual({
      id: "user-2",
      email: "existing@example.com",
      name: "Updated Name",
      createdAt
    });
  });

  it("creates a new Google user when no existing user is found", async () => {
    const userRepository = createUserRepositoryMock();
    const googleAuthClient = createGoogleAuthClientMock();
    const service = new AuthService(userRepository, googleAuthClient);
    const createdAt = new Date("2026-01-01T00:00:00.000Z");

    vi.mocked(googleAuthClient.exchangeAuthorizationCode).mockResolvedValue({ idToken: "id-token" });
    vi.mocked(googleAuthClient.verifyIdToken).mockResolvedValue({
      googleSubject: "google-sub-3",
      email: "new@example.com",
      name: "New User"
    });
    vi.mocked(userRepository.findByGoogleSubject).mockResolvedValue(null);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue({
      id: "user-3",
      email: "new@example.com",
      password: null,
      name: "New User",
      authProvider: "GOOGLE",
      role: "USER",
      googleSubject: "google-sub-3",
      createdAt,
      ratings: []
    } as never);

    const result = await service.authenticateWithGoogle({ authorizationCode: "auth-code" });

    expect(userRepository.create).toHaveBeenCalledWith({
      email: "new@example.com",
      password: null,
      name: "New User",
      authProvider: "GOOGLE",
      role: "USER",
      googleSubject: "google-sub-3"
    });
    expect(result.user).toEqual({
      id: "user-3",
      email: "new@example.com",
      name: "New User",
      createdAt
    });
  });
});

describe("GoogleAuthClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("exchanges authorization code and returns id token", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id_token: "id-token" })
    }) as never;

    const client = new GoogleAuthClient();
    const result = await client.exchangeAuthorizationCode({
      authorizationCode: "auth-code",
      redirectUri: "http://localhost:4000/auth/google/callback"
    });

    expect(result).toEqual({ idToken: "id-token" });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("throws when token exchange returns non-200", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    }) as never;

    const client = new GoogleAuthClient();

    await expect(
      client.exchangeAuthorizationCode({
        authorizationCode: "auth-code",
        redirectUri: "http://localhost:4000/auth/google/callback"
      })
    ).rejects.toEqual(new AppError("Google authentication failed", 401));
  });

  it("throws when token exchange payload has no id_token", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ access_token: "access" })
    }) as never;

    const client = new GoogleAuthClient();

    await expect(
      client.exchangeAuthorizationCode({
        authorizationCode: "auth-code",
        redirectUri: "http://localhost:4000/auth/google/callback"
      })
    ).rejects.toEqual(new AppError("Google authentication failed", 401));
  });

  it("verifies token info and returns identity", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        iss: "https://accounts.google.com",
        aud: "google-client-id-test",
        sub: "google-sub-1",
        email: "user@example.com",
        email_verified: "true",
        name: "User"
      })
    }) as never;

    const client = new GoogleAuthClient();
    const result = await client.verifyIdToken("id-token");

    expect(result).toEqual({
      googleSubject: "google-sub-1",
      email: "user@example.com",
      name: "User"
    });
  });

  it("supports alternate valid issuer and falls back name to email", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        iss: "accounts.google.com",
        aud: "google-client-id-test",
        sub: "google-sub-1",
        email: "user@example.com",
        email_verified: "true"
      })
    }) as never;

    const client = new GoogleAuthClient();
    const result = await client.verifyIdToken("id-token");

    expect(result).toEqual({
      googleSubject: "google-sub-1",
      email: "user@example.com",
      name: "user@example.com"
    });
  });

  it("throws when token info response is non-200", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    }) as never;

    const client = new GoogleAuthClient();

    await expect(client.verifyIdToken("id-token")).rejects.toEqual(
      new AppError("Google token validation failed", 401)
    );
  });

  it("throws when token info has invalid issuer or audience", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        iss: "https://issuer.invalid",
        aud: "google-client-id-test",
        sub: "google-sub-1",
        email: "user@example.com",
        email_verified: "true"
      })
    }) as never;

    const client = new GoogleAuthClient();

    await expect(client.verifyIdToken("id-token")).rejects.toEqual(
      new AppError("Google token validation failed", 401)
    );
  });

  it("throws when token info audience does not match client id", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        iss: "https://accounts.google.com",
        aud: "different-client-id",
        sub: "google-sub-1",
        email: "user@example.com",
        email_verified: "true"
      })
    }) as never;

    const client = new GoogleAuthClient();

    await expect(client.verifyIdToken("id-token")).rejects.toEqual(
      new AppError("Google token validation failed", 401)
    );
  });

  it("throws when required verified identity fields are missing", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        iss: "accounts.google.com",
        aud: "google-client-id-test",
        sub: "google-sub-1",
        email: "user@example.com",
        email_verified: "false"
      })
    }) as never;

    const client = new GoogleAuthClient();

    await expect(client.verifyIdToken("id-token")).rejects.toEqual(
      new AppError("Google account is missing required verified identity fields", 401)
    );
  });
});
