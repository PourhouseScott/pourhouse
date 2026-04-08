import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "@prisma/client";

export type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

export function signToken(payload: JwtPayload): string {
  const expiresIn = env.JWT_EXPIRES_IN as Exclude<jwt.SignOptions["expiresIn"], undefined>;
  const options: jwt.SignOptions = { expiresIn };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
