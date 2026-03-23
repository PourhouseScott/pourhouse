import type { Prisma, Wine } from "@prisma/client";

export type InventorySyncRow = {
  squareVariationId?: string;
  variationName: string;
  price: number;
  volumeOz?: number;
  isPublic?: boolean;
  isDefault?: boolean;
  locationId: string;
  sealedBottleCount: number;
  isAvailable: boolean;
  isFeatured: boolean;
};

export type SquareCatalogItemUpsertInput = {
  squareItemId: string;
  wineId: string;
  rawPayload: Prisma.InputJsonValue;
  extractedData: Prisma.InputJsonValue;
  isDeleted: boolean;
  lastSyncedAt: Date;
};

export type SquareCatalogVariationUpsertInput = {
  squareVariationId: string;
  squareCatalogItemId: string;
  wineVariationId: string | null;
  rawPayload: Prisma.InputJsonValue;
  extractedData: Prisma.InputJsonValue;
  isDeleted: boolean;
  lastSyncedAt: Date;
};

export type WineVariationKey = {
  id: string;
  squareVariationId: string | null;
};

export interface ISquareSyncRepository {
  ensureSquareDefaults(): Promise<{ regionId: string; wineryId: string }>;
  findWineBySquareItemId(squareItemId: string): Promise<Wine | null>;
  createWine(input: Prisma.WineUncheckedCreateInput): Promise<Wine>;
  updateWineSquareFieldsBySquareItemId(squareItemId: string, input: Prisma.WineUncheckedUpdateInput): Promise<Wine>;
  upsertSquareCatalogItem(input: SquareCatalogItemUpsertInput): Promise<{ id: string }>;
  upsertSquareCatalogVariation(input: SquareCatalogVariationUpsertInput): Promise<void>;
  replaceInventoryForWine(wineId: string, rows: InventorySyncRow[]): Promise<number>;
  findWineVariationsBySquareVariationIds(wineId: string, squareVariationIds: string[]): Promise<WineVariationKey[]>;
}
