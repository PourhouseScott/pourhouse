import cron from "node-cron";
import type { SquareSyncResult } from "@/integrations/square/squareWineSyncService";

export type SquareSyncLogger = Pick<Console, "info" | "warn" | "error">;

export type CatalogFetchService = {
  fetchCatalogItems(): Promise<unknown[]>;
};

export type CatalogSyncService = {
  syncCatalogObjects(catalogObjects: unknown[]): Promise<SquareSyncResult>;
};

export type SquareSyncTask = {
  start(): void;
  stop(): void;
};

export type SquareSyncCronScheduler = {
  schedule(cronExpression: string, run: () => Promise<void>): SquareSyncTask;
};

export type SquareSyncJobConfig = {
  enabled: boolean;
  cronExpression: string;
};

export type SquareSyncJobDeps = {
  catalogService: CatalogFetchService;
  syncService: CatalogSyncService;
  logger?: SquareSyncLogger;
  cronScheduler?: SquareSyncCronScheduler;
  now?: () => number;
};

export type SquareSyncJobHandle = {
  stop(): void;
  triggerNow(): Promise<void>;
};

const defaultLogger: SquareSyncLogger = console;

export function createNodeCronScheduler(): SquareSyncCronScheduler {
  return {
    schedule(cronExpression: string, run: () => Promise<void>) {
      if (!cron.validate(cronExpression)) {
        throw new Error(`Invalid SQUARE_SYNC_CRON expression: ${cronExpression}`);
      }

      const task = cron.schedule(cronExpression, run);

      task.stop();
      return task;
    }
  };
}

export async function runSquareSyncOnce(
  deps: Pick<SquareSyncJobDeps, "catalogService" | "syncService" | "logger" | "now">
): Promise<SquareSyncResult> {
  const logger = deps.logger ?? defaultLogger;
  const now = deps.now ?? Date.now;

  logger.info("[square-sync] run started");
  const startedAt = now();

  const catalogObjects = await deps.catalogService.fetchCatalogItems();
  const result = await deps.syncService.syncCatalogObjects(catalogObjects);

  logger.info(
    "[square-sync] run completed",
    JSON.stringify({
      catalogObjectsFetched: catalogObjects.length,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      inventoryRowsSynced: result.inventoryRowsSynced,
      durationMs: now() - startedAt
    })
  );

  return result;
}

export function createSquareSyncJob(config: SquareSyncJobConfig, deps: SquareSyncJobDeps): SquareSyncJobHandle {
  const logger = deps.logger ?? defaultLogger;
  const cronScheduler = deps.cronScheduler ?? createNodeCronScheduler();

  if (!config.enabled) {
    logger.info("[square-sync] scheduler disabled");
    return {
      stop() {
        // No-op by design when scheduler is disabled.
      },
      async triggerNow() {
        // No-op by design when scheduler is disabled.
      }
    };
  }

  let inProgress = false;

  const runTick = async () => {
    if (inProgress) {
      logger.warn("[square-sync] skipped run because a previous run is still in progress");
      return;
    }

    inProgress = true;
    try {
      await runSquareSyncOnce(deps);
    } catch (error) {
      logger.error("[square-sync] run failed", error);
    } finally {
      inProgress = false;
    }
  };

  const task = cronScheduler.schedule(config.cronExpression, runTick);
  task.start();
  logger.info(`[square-sync] scheduler started (cron: ${config.cronExpression})`);

  return {
    stop() {
      task.stop();
      logger.info("[square-sync] scheduler stopped");
    },
    async triggerNow() {
      await runTick();
    }
  };
}
