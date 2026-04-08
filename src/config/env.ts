import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_API_TOKEN: z.string().min(24, "ADMIN_API_TOKEN must be at least 24 characters"),
  SQUARE_ACCESS_TOKEN: z.string().min(1, "SQUARE_ACCESS_TOKEN is required"),
  SQUARE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("production")
});

export const env = envSchema.parse(process.env);
