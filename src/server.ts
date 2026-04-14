import app from "./app";
import { env } from "./config/env";
import { startSquareSyncScheduler } from "./integrations/square/squareSyncScheduler";

// 1. Define the Port and Host
const PORT = Number(env.PORT) || 8080;
const HOST = '0.0.0.0';

// 2. Start the server FIRST (to satisfy Google's health check immediately)
const server = app.listen(PORT, HOST, () => {
  console.log(`-----------------------------------------`);
  console.log(`Pourhouse Wine Co. API live on port ${PORT}`);
  console.log(`Binding to host ${HOST}`);
  console.log(`-----------------------------------------`);

  // 3. Start the scheduler AFTER the server is successfully listening
  try {
    const squareSyncScheduler = startSquareSyncScheduler();

    // Shutdown logic needs access to the scheduler
    const shutdown = (signal: string) => {
      console.log(`Received ${signal}, shutting down.`);
      squareSyncScheduler.stop();
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("Failed to start Square Sync Scheduler:", error);
    // We don't exit here so the web server stays up even if sync fails
  }
});
