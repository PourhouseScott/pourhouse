import type { CatalogObject } from "square";
import type { InventorySyncRow, ISquareSyncRepository } from "@/repositories/squareSync/ISquareSyncRepository";

export type SquareSyncResult = {
  created: number;
  updated: number;
  skipped: number;
  inventoryRowsSynced: number;
};

type ParsedSquareItem = {
  id: string;
  name: string;
  description: string;
  isDeleted: boolean;
  variations: ParsedSquareVariation[];
};

type ParsedSquareVariation = {
  id: string;
  name: string;
  priceAmountCents: number;
  isDeleted: boolean;
};

export class SquareWineSyncService {
  public constructor(private readonly squareSyncRepository: ISquareSyncRepository) { }

  public async syncCatalogObjects(catalogObjects: CatalogObject[]): Promise<SquareSyncResult> {
    const { regionId, wineryId } = await this.squareSyncRepository.ensureSquareDefaults();
    const parsedItems = this.parseCatalogItems(catalogObjects);

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

      const inventoryRows = this.mapVariationsToInventoryRows(item.variations, item.id);
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

  private parseCatalogItems(catalogObjects: CatalogObject[]): ParsedSquareItem[] {
    const itemsById = new Map<string, ParsedSquareItem>();
    const variationsByItemId = new Map<string, ParsedSquareVariation[]>();

    for (const object of catalogObjects) {
      if (object.type === "ITEM" && object.id) {
        const itemData = object.itemData;
        itemsById.set(object.id, {
          id: object.id,
          name: itemData?.name ?? "Unnamed Square Item",
          description: itemData?.description ?? "",
          isDeleted: object.isDeleted ?? false,
          variations: []
        });

        const embeddedVariations = (itemData?.variations ?? []) as unknown as Array<Record<string, unknown>>;

        for (const variation of embeddedVariations) {
          const variationId = this.readString(variation.id) ?? `${object.id}-variation`;
          const itemVariationData = (variation.itemVariationData ?? {}) as Record<string, unknown>;
          const priceMoney = (itemVariationData.priceMoney ?? {}) as Record<string, unknown>;
          const variationName =
            this.readString(itemVariationData.name) ??
            this.readString(variation.name) ??
            `Square Variation ${variationId}`;
          const current = variationsByItemId.get(object.id) ?? [];
          current.push({
            id: variationId,
            name: variationName,
            priceAmountCents: this.readNumber(priceMoney.amount),
            isDeleted: this.readBoolean(variation.isDeleted)
          });
          variationsByItemId.set(object.id, current);
        }
      }

      if (object.type === "ITEM_VARIATION") {
        const itemId = object.itemVariationData?.itemId;
        if (!itemId) {
          continue;
        }

        const current = variationsByItemId.get(itemId) ?? [];
        const variationName =
          this.readString(object.itemVariationData?.name) ??
          `Square Variation ${object.id ?? `${itemId}-variation`}`;
        current.push({
          id: object.id ?? `${itemId}-variation`,
          name: variationName,
          priceAmountCents: Number(object.itemVariationData?.priceMoney?.amount ?? 0),
          isDeleted: object.isDeleted ?? false
        });
        variationsByItemId.set(itemId, current);
      }
    }

    const parsedItems: ParsedSquareItem[] = [];

    for (const item of itemsById.values()) {
      const rawVariations = variationsByItemId.get(item.id) ?? [];
      const uniqueVariations = this.deduplicateVariations(rawVariations);

      parsedItems.push({
        ...item,
        variations: uniqueVariations
      });
    }

    return parsedItems;
  }

  private deduplicateVariations(variations: ParsedSquareVariation[]): ParsedSquareVariation[] {
    const seen = new Set<string>();
    const unique: ParsedSquareVariation[] = [];

    for (const variation of variations) {
      if (seen.has(variation.id)) {
        continue;
      }

      seen.add(variation.id);
      unique.push(variation);
    }

    return unique;
  }

  private readString(value: unknown): string | null {
    return typeof value === "string" && value.length > 0 ? value : null;
  }

  private readNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private readBoolean(value: unknown): boolean {
    return value === true;
  }

  private mapVariationsToInventoryRows(variations: ParsedSquareVariation[], itemId: string): InventorySyncRow[] {
    const source =
      variations.length > 0
        ? variations
        : [
          {
            id: `${itemId}-default`,
            name: `Square Variation ${itemId}-default`,
            priceAmountCents: 0,
            isDeleted: false
          }
        ];

    return source.map((variation) => {
      const price = variation.priceAmountCents > 0 ? variation.priceAmountCents / 100 : 0;
      const volumeOz = this.parseVolumeOz(variation.name);
      const isTwoOz = volumeOz === 2;
      const isNineOz = volumeOz === 9;

      return {
        squareVariationId: variation.id,
        variationName: variation.name,
        price,
        ...(volumeOz !== null ? { volumeOz } : {}),
        isPublic: !isTwoOz,
        isDefault: isNineOz,
        locationId: `square:${variation.id}`,
        stockQuantity: 0,
        isAvailable: !variation.isDeleted,
        isFeatured: false
      };
    });
  }

  private parseVolumeOz(name: string): number | null {
    const normalized = name.trim().toLowerCase();
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*oz\b/);
    if (!match) {
      return null;
    }

    return Math.round(Number(match[1]));
  }

  private buildSlug(name: string, squareItemId: string): string {
    const safeName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    return `${safeName || "square-item"}-${squareItemId.toLowerCase()}`;
  }

  private buildSyntheticVintage(squareItemId: string): number {
    const hash = [...squareItemId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 1900 + (hash % 201);
  }
}
