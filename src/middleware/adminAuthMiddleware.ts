import { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/appError";
import { verifyToken } from "@/utils/jwt";
import { prisma } from "@/config/prisma";
import { UserRepository } from "@/repositories/user/UserRepository";

const userRepository = new UserRepository(prisma);

function logDeniedAdminAccess(
  req: Request,
  reason: "missing_header" | "invalid_token" | "invalid_role"
) {
  console.warn("Admin access denied", {
    reason,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });
}

export async function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logDeniedAdminAccess(req, "missing_header");
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();
  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    logDeniedAdminAccess(req, "invalid_token");
    throw new AppError("Unauthorized", 401);
  }

  const user = await userRepository.findById(payload.userId);

  if (!user || user.role !== "ADMIN") {
    logDeniedAdminAccess(req, "invalid_role");
    throw new AppError("Unauthorized", 401);
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: user.role
  };

  next();
}
