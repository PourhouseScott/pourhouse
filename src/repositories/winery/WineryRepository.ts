import type { PrismaClient } from "@prisma/client";
import type { IWineryRepository } from "@/repositories/winery/IWineryRepository";

export class WineryRepository implements IWineryRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async findById(id: string) {
    return this.prisma.winery.findUnique({ where: { id } });
  }
}
