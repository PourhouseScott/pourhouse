import type { Inventory, Prisma, Region, Wine, Winery } from "@prisma/client";

export type WineWithRelations = Wine & {
  winery: Winery;
  region: Region;
};

export type WineWithInventory = WineWithRelations & {
  inventory: Inventory[];
};

export type WineListFilters = {
  country?: string;
  regionId?: string;
  wineryId?: string;
  featuredOnly?: boolean;
  hasGlass?: boolean;
  hasBottle?: boolean;
};

export interface IWineRepository {
  findMany(filters: WineListFilters): Promise<WineWithInventory[]>;
  findByIdWithInventory(id: string): Promise<WineWithInventory | null>;
  findBySlugWithInventory(slug: string): Promise<WineWithInventory | null>;
  findByUniqueNameWineryVintage(input: {
    name: string;
    wineryId: string;
    vintage: number;
  }): Promise<Wine | null>;
  create(input: Prisma.WineUncheckedCreateInput): Promise<WineWithRelations>;
  search(query: string): Promise<WineWithRelations[]>;
}
