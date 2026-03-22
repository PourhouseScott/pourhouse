import type { CatalogObject } from "square";
import type { ISquareSyncRepository } from "@/repositories/squareSync/ISquareSyncRepository";
import { SquareCatalogParser } from "@/integrations/square/squareCatalogParser";
import { normalizeSlugSegment } from "@/utils/slug";

export type SquareSyncResult = {
  created: number;
  updated: number;
  skipped: number;
  inventoryRowsSynced: number;
};

export class SquareWineSyncService {
  public constructor(
    private readonly squareSyncRepository: ISquareSyncRepository,
    private readonly catalogParser: SquareCatalogParser = new SquareCatalogParser()
  ) { }

  public async syncCatalogObjects(catalogObjects: CatalogObject[]): Promise<SquareSyncResult> {
    const { regionId, wineryId } = await this.squareSyncRepository.ensureSquareDefaults();
    const parsedItems = this.catalogParser.parseCatalogItems(catalogObjects);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let inventoryRowsSynced = 0;

    for (const item of parsedItems) {
      if (!item.id || !item.name) {
        skipped += 1;
        continue;
      }

      const existingWine = await this.squareSyncRepository.findWineBySquareItemId(item.id);
      const winePayload = {
        squareItemId: item.id,
        name: item.name,
        slug: this.buildSlug(item.name, item.id),
        vintage: this.buildSyntheticVintage(item.id),
        wineryId,
        regionId,
        country: "Unknown",
        grapeVarieties: [],
        alcoholPercent: 0,
        description: item.description || "Imported from Square catalog.",
        imageUrl: "https://images.example.com/square-import-placeholder.jpg"
      };

      const wine = existingWine
        ? await this.squareSyncRepository.updateWineBySquareItemId(item.id, winePayload)
        : await this.squareSyncRepository.createWine(winePayload);

      if (existingWine) {
        updated += 1;
      } else {
        created += 1;
      }

      const inventoryRows = this.catalogParser.mapVariationsToInventoryRows(item.variations, item.id);
      const syncedRows = await this.squareSyncRepository.replaceInventoryForWine(wine.id, inventoryRows);
      inventoryRowsSynced += syncedRows;
    }

    return {
      created,
      updated,
      skipped,
      inventoryRowsSynced
    };
  }

  private buildSlug(name: string, squareItemId: string): string {
    const safeName = normalizeSlugSegment(name);

    return `${safeName || "square-item"}-${squareItemId.toLowerCase()}`;
  }

  private buildSyntheticVintage(squareItemId: string): number {
    const hash = [...squareItemId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 1900 + (hash % 201);
  }
}
