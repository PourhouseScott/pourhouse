import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { verifyToken } from "../utils/jwt";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid authorization header", 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const payload = verifyToken(token);

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role
  };

  next();
}
