import type { Winery } from "@prisma/client";

export interface IWineryRepository {
  findById(id: string): Promise<Winery | null>;
}
