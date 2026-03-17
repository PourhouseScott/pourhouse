import type { Region } from "@prisma/client";

export interface IRegionRepository {
  findById(id: string): Promise<Region | null>;
}
