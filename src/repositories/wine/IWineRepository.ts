import type {
  Flight,
  FlightWine,
  Inventory,
  Prisma,
  Region,
  Wine,
  Winery,
  WineVariation,
  WineVariationServingMode
} from "@prisma/client";

export type WineWithRelations = Wine & {
  winery: Winery;
  region: Region;
};

export type WineWithInventory = WineWithRelations & {
  inventory?: Inventory[];
  flightMemberships?: (FlightWine & {
    flight: Pick<Flight, "isActive">;
  })[];
  variations: (WineVariation & {
    inventory?: Inventory[];
    servingModeConfig?: WineVariationServingMode | null;
  })[];
};

export type WineListFilters = {
  country?: string | undefined;
  regionId?: string | undefined;
  wineryId?: string | undefined;
  featuredOnly?: boolean | undefined;
  hasGlass?: boolean | undefined;
  hasBottle?: boolean | undefined;
};

export interface IWineRepository {
  findMany(filters: WineListFilters): Promise<WineWithInventory[]>;
  findBySlug(slug: string): Promise<Wine | null>;
  findBySquareItemId(squareItemId: string): Promise<Wine | null>;
  findByIdWithInventory(id: string): Promise<WineWithInventory | null>;
  findBySlugWithInventory(slug: string): Promise<WineWithInventory | null>;
  findByUniqueNameWineryVintage(input: {
    name: string;
    wineryId: string;
    vintage: number;
  }): Promise<Wine | null>;
  create(input: Prisma.WineUncheckedCreateInput): Promise<WineWithRelations>;
  search(query: string): Promise<WineWithRelations[]>;

  update(id: string, input: Partial<Prisma.WineUncheckedUpdateInput>): Promise<WineWithRelations>;
  delete(id: string): Promise<void>;
}
