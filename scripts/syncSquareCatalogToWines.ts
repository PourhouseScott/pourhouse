import "dotenv/config";
import { prisma } from "@/config/prisma";
import { createSquareCatalogClient } from "@/integrations/square/squareCatalogClient";
import { SquareCatalogService } from "@/integrations/square/squareCatalogService";
import { SquareWineSyncService } from "@/integrations/square/squareWineSyncService";
import { SquareSyncRepository } from "@/repositories/squareSync/SquareSyncRepository";

async function main() {
  const catalogClient = createSquareCatalogClient();
  const catalogService = new SquareCatalogService(catalogClient);
  const squareSyncRepository = new SquareSyncRepository(prisma);
  const squareWineSyncService = new SquareWineSyncService(squareSyncRepository);

  console.log("Fetching Square catalog objects...");
  const catalogObjects = await catalogService.fetchCatalogItems();
  console.log(`Fetched ${catalogObjects.length} catalog objects.`);

  console.log("Syncing catalog objects to internal wines and inventory...");
  const result = await squareWineSyncService.syncCatalogObjects(catalogObjects);

  console.log("Square wine sync complete.");
  console.log(
    JSON.stringify(
      {
        createdWines: result.created,
        updatedWines: result.updated,
        skippedItems: result.skipped,
        inventoryRowsSynced: result.inventoryRowsSynced
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Square wine sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
