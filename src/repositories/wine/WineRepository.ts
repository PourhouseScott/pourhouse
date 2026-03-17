import type { PrismaClient, Prisma } from "@prisma/client";
import type { IWineRepository } from "@/repositories/wine/IWineRepository";

export class WineRepository implements IWineRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async findMany() {
    return this.prisma.wine.findMany({
      include: {
        winery: true,
        region: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  public async findByIdWithInventory(id: string) {
    return this.prisma.wine.findUnique({
      where: { id },
      include: {
        winery: true,
        region: true,
        inventory: true
      }
    });
  }

  public async findByUniqueNameWineryVintage(input: {
    name: string;
    wineryId: string;
    vintage: number;
  }) {
    return this.prisma.wine.findUnique({
      where: {
        name_wineryId_vintage: {
          name: input.name,
          wineryId: input.wineryId,
          vintage: input.vintage
        }
      }
    });
  }

  public async create(input: Prisma.WineUncheckedCreateInput) {
    return this.prisma.wine.create({
      data: input,
      include: {
        winery: true,
        region: true
      }
    });
  }

  public async search(query: string) {
    return this.prisma.wine.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { country: { contains: query, mode: "insensitive" } },
          { winery: { name: { contains: query, mode: "insensitive" } } },
          { region: { name: { contains: query, mode: "insensitive" } } }
        ]
      },
      include: {
        winery: true,
        region: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
