import type { Prisma, Wine } from "@prisma/client";

export interface IWineRepository {
  findMany(): Promise<unknown[]>;
  findByIdWithInventory(id: string): Promise<unknown | null>;
  findByUniqueNameWineryVintage(input: {
    name: string;
    wineryId: string;
    vintage: number;
  }): Promise<Wine | null>;
  create(input: Prisma.WineUncheckedCreateInput): Promise<unknown>;
  search(query: string): Promise<unknown[]>;
}
