import { NextFunction, Request, Response } from "express";
import { env } from "@/config/env";
import { AppError } from "@/utils/appError";

function logDeniedAdminAccess(req: Request, reason: "missing_header" | "invalid_token") {
  console.warn("Admin access denied", {
    reason,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });
}

export function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logDeniedAdminAccess(req, "missing_header");
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token || token !== env.ADMIN_API_TOKEN) {
    logDeniedAdminAccess(req, "invalid_token");
    throw new AppError("Unauthorized", 401);
  }

  next();
}
