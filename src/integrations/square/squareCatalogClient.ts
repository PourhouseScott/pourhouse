import { SquareClient, SquareEnvironment } from "square";
import { env } from "@/config/env";

export function createSquareCatalogClient() {
  const client = new SquareClient({
    token: env.SQUARE_ACCESS_TOKEN,
    environment:
      env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox
  });

  return client.catalog;
}
