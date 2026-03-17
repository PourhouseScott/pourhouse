import type { Prisma } from "@prisma/client";

export interface IInventoryRepository {
  findMany(): Promise<unknown[]>;
  findById(id: string): Promise<unknown | null>;
  create(input: Prisma.InventoryCreateInput): Promise<unknown>;
  update(id: string, input: Prisma.InventoryUpdateInput): Promise<unknown>;
}
