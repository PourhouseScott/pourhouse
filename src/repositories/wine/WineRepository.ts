  public async update(id: string, input: Partial<Prisma.WineUncheckedUpdateInput>) {
  return this.prisma.wine.update({
    where: { id },
    data: input,
    include: {
      winery: true,
      region: true
    }
  });
}

  public async delete (id: string) {
  await this.prisma.wine.delete({
    where: { id }
  });
}

import type { PrismaClient, Prisma } from "@prisma/client";
import type { IWineRepository, WineListFilters } from "@/repositories/wine/IWineRepository";

export class WineRepository implements IWineRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async update(id: string, input: Partial<Prisma.WineUncheckedUpdateInput>) {
    return this.prisma.wine.update({
      where: { id },
      data: input,
      include: {
        winery: true,
        region: true
      }
    });
  }

  public async delete(id: string) {
    await this.prisma.wine.delete({
      where: { id }
    });
  }

  public async findMany(filters: WineListFilters) {
    const variationWhere = this.buildVariationWhere(filters);

    return this.prisma.wine.findMany({
      where: this.buildWineListWhere(filters, variationWhere),
      include: {
        winery: true,
        region: true,
        inventory: true,
        flightMemberships: {
          include: {
            flight: {
              select: {
                isActive: true
              }
            }
          }
        },
        variations: {
          where: variationWhere,
          include: {
            servingModeConfig: true
          }
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
        flightMemberships: {
          include: {
            flight: {
              select: {
                isActive: true
              }
            }
          }
        },
        variations: {
          include: {
            servingModeConfig: true
          }
        }
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
        flightMemberships: {
          include: {
            flight: {
              select: {
                isActive: true
              }
            }
          }
        },
        variations: {
          where: {
            isPublic: true
          },
          include: {
            servingModeConfig: true
          }
        }
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
    const glassVariationPredicate: Prisma.WineVariationWhereInput = {
      servingModeConfig: {
        is: {
          servingMode: { in: ["GLASS_5OZ", "GLASS_9OZ"] },
          isAvailable: true
        }
      }
    };

    const bottleVariationPredicate: Prisma.WineVariationWhereInput = {
      servingModeConfig: {
        is: {
          servingMode: "BOTTLE_750ML",
          isAvailable: true
        }
      }
    };

    const andClauses: Prisma.WineWhereInput[] = [
      {
        variations: {
          some: variationWhere
        }
      }
    ];

    if (filters.hasGlass === true) {
      andClauses.push({
        variations: {
          some: glassVariationPredicate
        }
      });
    }

    if (filters.hasGlass === false) {
      andClauses.push({
        NOT: {
          variations: {
            some: glassVariationPredicate
          }
        }
      });
    }

    if (filters.hasBottle === true) {
      andClauses.push({
        variations: {
          some: bottleVariationPredicate
        }
      });
    }

    if (filters.hasBottle === false) {
      andClauses.push({
        NOT: {
          variations: {
            some: bottleVariationPredicate
          }
        }
      });
    }

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
      AND: andClauses
    };
  }
}
