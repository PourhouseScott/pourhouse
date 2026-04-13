import app from "./app";
import { env } from "./config/env";
import { startSquareSyncScheduler } from "./integrations/square/squareSyncScheduler";

const squareSyncScheduler = startSquareSyncScheduler();

const server = app.listen(env.PORT, () => {
  console.log(`Pourhouse Wine Co. API listening on port ${env.PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down.`);
  squareSyncScheduler.stop();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
