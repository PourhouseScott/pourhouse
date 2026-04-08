import type { Request, Response } from "express";
import { AuthService } from "@/services/authService";
import { env } from "@/config/env";

function normalizeReturnTo(input: unknown) {
  if (typeof input !== "string") {
    return "/admin/wines";
  }

  const trimmed = input.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/admin/wines";
  }

  return trimmed;
}

function encodeState(returnTo: string) {
  return Buffer.from(returnTo, "utf-8").toString("base64url");
}

function decodeState(input: unknown) {
  if (typeof input !== "string" || !input) {
    return "/admin/wines";
  }

  const decoded = Buffer.from(input, "base64url").toString("utf-8");
  return normalizeReturnTo(decoded);
}

export class AuthController {
  public constructor(private readonly authService: AuthService) { }

  public startGoogleSignIn = async (req: Request, res: Response) => {
    const returnTo = normalizeReturnTo(req.query.returnTo);
    const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    authorizationUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
    authorizationUrl.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("state", encodeState(returnTo));

    res.redirect(302, authorizationUrl.toString());
  };

  public handleGoogleCallback = async (req: Request, res: Response) => {
    const returnTo = decodeState(req.query.state);
    const authorizationCode = typeof req.query.code === "string" ? req.query.code : "";

    if (!authorizationCode) {
      res.redirect(302, `${returnTo}?authError=missing_code`);
      return;
    }

    try {
      const result = await this.authService.authenticateWithGoogle({
        authorizationCode,
        redirectUri: env.GOOGLE_REDIRECT_URI
      });

      res.redirect(302, `${returnTo}#token=${encodeURIComponent(result.token)}`);
    } catch {
      res.redirect(302, `${returnTo}?authError=google_auth_failed`);
    }
  };

  public authenticateWithGoogle = async (req: Request, res: Response) => {
    const result = await this.authService.authenticateWithGoogle(req.body);
    res.status(200).json(result);
  };
}
