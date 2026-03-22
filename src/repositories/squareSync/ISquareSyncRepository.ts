import type { Prisma, Wine } from "@prisma/client";

export type InventorySyncRow = {
  squareVariationId?: string;
  variationName: string;
  price: number;
  volumeOz?: number;
  isPublic?: boolean;
  isDefault?: boolean;
  locationId: string;
  stockQuantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
};

export interface ISquareSyncRepository {
  ensureSquareDefaults(): Promise<{ regionId: string; wineryId: string }>;
  findWineBySquareItemId(squareItemId: string): Promise<Wine | null>;
  createWine(input: Prisma.WineUncheckedCreateInput): Promise<Wine>;
  updateWineBySquareItemId(squareItemId: string, input: Prisma.WineUncheckedUpdateInput): Promise<Wine>;
  replaceInventoryForWine(wineId: string, rows: InventorySyncRow[]): Promise<number>;
}
