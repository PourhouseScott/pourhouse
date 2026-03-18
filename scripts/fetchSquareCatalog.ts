import "dotenv/config";
import { createSquareCatalogClient } from "@/integrations/square/squareCatalogClient";
import { SquareCatalogService } from "@/integrations/square/squareCatalogService";

async function main() {
  const catalogClient = createSquareCatalogClient();
  const service = new SquareCatalogService(catalogClient);

  console.log("Fetching Square catalog items...\n");

  const items = await service.fetchCatalogItems();

  console.log(`Retrieved ${items.length} catalog objects (ITEMs + ITEM_VARIATIONs)\n`);
  console.log(JSON.stringify(items, null, 2));
}

main().catch((error) => {
  console.error("Failed to fetch Square catalog:", error);
  process.exit(1);
});
