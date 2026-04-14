import app from "./app";
import { env } from "./config/env";
import { startSquareSyncScheduler } from "./integrations/square/squareSyncScheduler";
import cors from 'cors';

const PORT = Number(env.PORT) || 8080;
const HOST = '0.0.0.0';

app.use(cors({
  origin: [
    'https://www.pourhousewineco.com',
    'https://pourhousewineco.com',
    'https://pourhouse-wine-co.squarespace.com' // internal dev domain
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

const server = app.listen(PORT, HOST, () => {
  console.log(`-----------------------------------------`);
  console.log(`Pourhouse Wine Co. API live on port ${PORT}`);
  console.log(`Binding to host ${HOST}`);
  console.log(`-----------------------------------------`);

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
