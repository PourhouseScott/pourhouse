import type { PrismaClient, Prisma } from "@prisma/client";
import type { IWineRepository, WineListFilters } from "@/repositories/wine/IWineRepository";

export class WineRepository implements IWineRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async findMany(filters: WineListFilters) {
    const variationWhere = this.buildVariationWhere(filters);

    return this.prisma.wine.findMany({
      where: this.buildWineListWhere(filters, variationWhere),
      include: {
        winery: true,
        region: true,
        inventory: true,
        variations: {
          where: variationWhere
        }
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
        inventory: true,
        variations: true
      }
    });
  }

  public async findBySlug(slug: string) {
    return this.prisma.wine.findUnique({
      where: { slug }
    });
  }

  public async findBySquareItemId(squareItemId: string) {
    return this.prisma.wine.findUnique({
      where: { squareItemId }
    });
  }

  public async findBySlugWithInventory(slug: string) {
    return this.prisma.wine.findUnique({
      where: { slug },
      include: {
        winery: true,
        region: true,
        inventory: true,
        variations: true
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

  private buildVariationWhere(filters: WineListFilters): Prisma.WineVariationWhereInput {
    return {
      isPublic: true
    };
  }

  private buildWineListWhere(
    filters: WineListFilters,
    variationWhere: Prisma.WineVariationWhereInput
  ): Prisma.WineWhereInput {
    return {
      ...(filters.country
        ? {
          country: {
            equals: filters.country,
            mode: "insensitive"
          }
        }
        : {}),
      ...(filters.regionId ? { regionId: filters.regionId } : {}),
      ...(filters.wineryId ? { wineryId: filters.wineryId } : {}),
      ...(filters.featuredOnly ? { inventory: { some: { isFeatured: true } } } : {}),
      variations: {
        some: variationWhere
      }
    };
  }
}
