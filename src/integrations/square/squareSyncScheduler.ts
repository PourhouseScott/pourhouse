import { prisma } from "@/config/prisma";
import { env } from "@/config/env";
import { createNodeCronScheduler, createSquareSyncJob, type SquareSyncJobHandle, type SquareSyncLogger } from "@/integrations/square/squareSyncJob";
import { createSquareCatalogClient } from "@/integrations/square/squareCatalogClient";
import { SquareCatalogService } from "@/integrations/square/squareCatalogService";
import { SquareWineSyncService } from "@/integrations/square/squareWineSyncService";
import { SquareSyncRepository } from "@/repositories/squareSync/SquareSyncRepository";
import type { CatalogObject } from "square";

export function startSquareSyncScheduler(logger: SquareSyncLogger = console): SquareSyncJobHandle {
  if (!env.SQUARE_SYNC_ENABLED) {
    logger.info("[square-sync] scheduler not enabled by configuration");
    return createSquareSyncJob(
      {
        enabled: false,
        cronExpression: env.SQUARE_SYNC_CRON
      },
      {
        catalogService: {
          fetchCatalogItems: async () => []
        },
        syncService: {
          syncCatalogObjects: async () => ({
            created: 0,
            updated: 0,
            skipped: 0,
            inventoryRowsSynced: 0
          })
        },
        logger
      }
    );
  }

  const catalogClient = createSquareCatalogClient();
  const catalogService = new SquareCatalogService(catalogClient);
  const squareSyncRepository = new SquareSyncRepository(prisma);
  const syncService = new SquareWineSyncService(squareSyncRepository);

  return createSquareSyncJob(
    {
      enabled: true,
      cronExpression: env.SQUARE_SYNC_CRON
    },
    {
      catalogService: {
        fetchCatalogItems: () => catalogService.fetchCatalogItems()
      },
      syncService: {
        syncCatalogObjects: (catalogObjects: unknown[]) =>
          syncService.syncCatalogObjects(catalogObjects as CatalogObject[])
      },
      cronScheduler: createNodeCronScheduler(),
      logger
    }
  );
}
