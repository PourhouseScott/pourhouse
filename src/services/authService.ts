import type { IUserRepository } from "@/repositories/user/IUserRepository";
import { AppError } from "@/utils/appError";
import { signToken } from "@/utils/jwt";
import { env } from "@/config/env";

type GoogleTokenResponse = {
  id_token?: string;
};

type GoogleTokenInfoResponse = {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  name?: string;
};

export type GoogleAuthInput = {
  authorizationCode: string;
  redirectUri?: string;
};

export type GoogleIdentity = {
  googleSubject: string;
  email: string;
  name: string;
};

export interface IGoogleAuthClient {
  exchangeAuthorizationCode(input: {
    authorizationCode: string;
    redirectUri: string;
  }): Promise<{ idToken: string }>;
  verifyIdToken(idToken: string): Promise<GoogleIdentity>;
}

export class GoogleAuthClient implements IGoogleAuthClient {
  public async exchangeAuthorizationCode(input: {
    authorizationCode: string;
    redirectUri: string;
  }) {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code: input.authorizationCode,
        grant_type: "authorization_code",
        redirect_uri: input.redirectUri
      })
    });

    if (!response.ok) {
      throw new AppError("Google authentication failed", 401);
    }

    const payload = await response.json() as GoogleTokenResponse;

    if (!payload.id_token) {
      throw new AppError("Google authentication failed", 401);
    }

    return { idToken: payload.id_token };
  }

  public async verifyIdToken(idToken: string) {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new AppError("Google token validation failed", 401);
    }

    const payload = await response.json() as GoogleTokenInfoResponse;

    const isValidIssuer = payload.iss === "accounts.google.com"
      || payload.iss === "https://accounts.google.com";

    if (!isValidIssuer || payload.aud !== env.GOOGLE_CLIENT_ID) {
      throw new AppError("Google token validation failed", 401);
    }

    if (payload.email_verified !== "true" || !payload.sub || !payload.email) {
      throw new AppError("Google account is missing required verified identity fields", 401);
    }

    return {
      googleSubject: payload.sub,
      email: payload.email,
      name: payload.name?.trim() || payload.email
    };
  }
}

export class AuthService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly googleAuthClient: IGoogleAuthClient = new GoogleAuthClient()
  ) { }

  public async authenticateWithGoogle(input: GoogleAuthInput) {
    const redirectUri = input.redirectUri ?? env.GOOGLE_REDIRECT_URI;
    const { idToken } = await this.googleAuthClient.exchangeAuthorizationCode({
      authorizationCode: input.authorizationCode,
      redirectUri
    });
    const googleIdentity = await this.googleAuthClient.verifyIdToken(idToken);

    const user = await this.findOrCreateGoogleUser(googleIdentity);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    };
  }

  private async findOrCreateGoogleUser(identity: GoogleIdentity) {
    const bySubject = await this.userRepository.findByGoogleSubject(identity.googleSubject);
    if (bySubject) {
      return bySubject;
    }

    const byEmail = await this.userRepository.findByEmail(identity.email);
    if (byEmail) {
      return this.userRepository.updateGoogleIdentityById({
        userId: byEmail.id,
        googleSubject: identity.googleSubject,
        name: identity.name
      });
    }

    return this.userRepository.create({
      email: identity.email,
      password: null,
      name: identity.name,
      authProvider: "GOOGLE",
      role: "USER",
      googleSubject: identity.googleSubject
    });
  }
}
