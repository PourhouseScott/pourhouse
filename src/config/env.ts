import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const booleanEnvSchema = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REDIRECT_URI: z.string().url("GOOGLE_REDIRECT_URI must be a valid URL"),
  SQUARE_ACCESS_TOKEN: z.string().min(1, "SQUARE_ACCESS_TOKEN is required"),
  SQUARE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("production"),
  SQUARE_SYNC_ENABLED: booleanEnvSchema,
  SQUARE_SYNC_CRON: z.string().min(1, "SQUARE_SYNC_CRON is required")
    .default("*/10 * * * *")
});

export const env = envSchema.parse(process.env);
