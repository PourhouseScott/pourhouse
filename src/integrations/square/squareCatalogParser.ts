import type { CatalogObject } from "square";
import type { InventorySyncRow } from "@/repositories/squareSync/ISquareSyncRepository";

export type ParsedSquareItem = {
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

export class SquareCatalogParser {
  public parseCatalogItems(catalogObjects: CatalogObject[]): ParsedSquareItem[] {
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

  public mapVariationsToInventoryRows(variations: ParsedSquareItem["variations"], itemId: string): InventorySyncRow[] {
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
        sealedBottleCount: 0,
        isAvailable: !variation.isDeleted,
        isFeatured: false
      };
    });
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

  private parseVolumeOz(name: string): number | null {
    const normalized = name.trim().toLowerCase();
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*oz\b/);
    if (!match) {
      return null;
    }

    return Math.round(Number(match[1]));
  }
}
