import type { PrismaClient, Prisma } from "@prisma/client";
import type { ISquareSyncRepository, InventorySyncRow } from "@/repositories/squareSync/ISquareSyncRepository";

const SQUARE_REGION_ID = "00000000-0000-0000-0000-000000000001";
const SQUARE_WINERY_ID = "00000000-0000-0000-0000-000000000002";

export class SquareSyncRepository implements ISquareSyncRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async ensureSquareDefaults() {
    const region = await this.prisma.region.upsert({
      where: { id: SQUARE_REGION_ID },
      update: {},
      create: {
        id: SQUARE_REGION_ID,
        name: "Square Imports"
      }
    });

    const winery = await this.prisma.winery.upsert({
      where: { id: SQUARE_WINERY_ID },
      update: {},
      create: {
        id: SQUARE_WINERY_ID,
        name: "Square Imports",
        regionId: region.id,
        country: "Unknown",
        website: "https://squareup.com",
        description: "Auto-generated placeholder winery for Square catalog sync."
      }
    });

    return {
      regionId: region.id,
      wineryId: winery.id
    };
  }

  public async findWineBySquareItemId(squareItemId: string) {
    return this.prisma.wine.findUnique({
      where: { squareItemId }
    });
  }

  public async createWine(input: Prisma.WineUncheckedCreateInput) {
    return this.prisma.wine.create({ data: input });
  }

  public async updateWineBySquareItemId(squareItemId: string, input: Prisma.WineUncheckedUpdateInput) {
    return this.prisma.wine.update({
      where: { squareItemId },
      data: input
    });
  }

  public async replaceInventoryForWine(wineId: string, rows: InventorySyncRow[]) {
    return this.prisma.$transaction(async (tx) => {
      // Delete existing variations and their inventory for this wine
      const existingVariations = await tx.wineVariation.findMany({
        where: { wineId },
        select: { id: true }
      });

      const variationIds = existingVariations.map(v => v.id);
      if (variationIds.length > 0) {
        await tx.inventory.deleteMany({
          where: { wineVariationId: { in: variationIds } }
        });
        await tx.wineVariation.deleteMany({
          where: { wineId }
        });
      }

      if (rows.length === 0) {
        return 0;
      }

      // Group rows by variation to create unique variations
      const variationMap = new Map<string, InventorySyncRow>();
      rows.forEach(row => {
        const key = row.squareVariationId || row.variationName;
        if (!variationMap.has(key)) {
          variationMap.set(key, row);
        }
      });
      const variationRows = Array.from(variationMap.values());
      const defaultVariationRow = variationRows.find((row) => row.isDefault);
      const fallbackDefaultRow = variationRows.find((row) => row.isPublic ?? true) ?? variationRows[0];
      const selectedDefaultKey =
        (defaultVariationRow?.squareVariationId || defaultVariationRow?.variationName) ??
        (fallbackDefaultRow?.squareVariationId || fallbackDefaultRow?.variationName);

      // Create variations first
      const variations = await Promise.all(
        variationRows.map((row) =>
          tx.wineVariation.create({
            data: {
              wineId,
              squareVariationId: row.squareVariationId ?? null,
              name: row.variationName,
              price: row.price,
              volumeOz: row.volumeOz ?? null,
              isPublic: row.isPublic ?? true,
              isDefault: (row.squareVariationId || row.variationName) === selectedDefaultKey
            }
          })
        )
      );

      // Create a map of variation keys to IDs for quick lookup
      const variationIdMap = new Map<string, string>();
      variations.forEach((variation, index) => {
        const row = variationRows[index]!;
        const key = row.squareVariationId || row.variationName;
        variationIdMap.set(key, variation.id);
      });

      // Create inventory entries
      await tx.inventory.createMany({
        data: rows.map(row => ({
          wineVariationId: variationIdMap.get(row.squareVariationId || row.variationName)!,
          locationId: row.locationId,
          stockQuantity: row.stockQuantity,
          isAvailable: row.isAvailable,
          isFeatured: row.isFeatured
        }))
      });

      return rows.length;
    });
  }
}
