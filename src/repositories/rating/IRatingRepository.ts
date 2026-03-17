import type { Prisma } from "@prisma/client";

export interface IRatingRepository {
  create(input: Prisma.RatingCreateInput): Promise<unknown>;
  findByWineId(wineId: string): Promise<unknown[]>;
}
