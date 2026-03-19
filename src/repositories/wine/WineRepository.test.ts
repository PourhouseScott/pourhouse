import { describe, expect, it, vi } from "vitest";
import { WineRepository } from "@/repositories/wine/WineRepository";

describe("WineRepository", () => {
  it("findMany returns only wines with available inventory", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      wine: {
        findMany
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findMany({});

    expect(findMany).toHaveBeenCalledWith({
      where: {
        inventory: {
          some: {
            isAvailable: true
          }
        }
      },
      include: {
        winery: true,
        region: true,
        inventory: {
          where: {
            isAvailable: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("findMany applies wine and inventory filters", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      wine: {
        findMany
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findMany({
      country: "US",
      regionId: "region-1",
      wineryId: "winery-1",
      featuredOnly: true,
      hasGlass: true,
      hasBottle: true
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        country: {
          equals: "US",
          mode: "insensitive"
        },
        regionId: "region-1",
        wineryId: "winery-1",
        inventory: {
          some: {
            isAvailable: true,
            isFeatured: true,
            priceGlass: {
              gt: 0
            },
            priceBottle: {
              gt: 0
            }
          }
        }
      },
      include: {
        winery: true,
        region: true,
        inventory: {
          where: {
            isAvailable: true,
            isFeatured: true,
            priceGlass: {
              gt: 0
            },
            priceBottle: {
              gt: 0
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("findByIdWithInventory requests winery, region, and inventory", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      wine: {
        findUnique
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findByIdWithInventory("wine-1");

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "wine-1" },
      include: {
        winery: true,
        region: true,
        inventory: true
      }
    });
  });

  it("findBySlugWithInventory requests winery, region, and inventory", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      wine: {
        findUnique
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findBySlugWithInventory("cabernet-2020");

    expect(findUnique).toHaveBeenCalledWith({
      where: { slug: "cabernet-2020" },
      include: {
        winery: true,
        region: true,
        inventory: true
      }
    });
  });

  it("findByUniqueNameWineryVintage queries the compound unique key", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      wine: {
        findUnique
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findByUniqueNameWineryVintage({
      name: "Cabernet",
      wineryId: "winery-1",
      vintage: 2020
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        name_wineryId_vintage: {
          name: "Cabernet",
          wineryId: "winery-1",
          vintage: 2020
        }
      }
    });
  });

  it("create includes winery and region relations", async () => {
    const create = vi.fn().mockResolvedValue(null);
    const prisma = {
      wine: {
        create
      }
    } as never;

    const repository = new WineRepository(prisma);
    const input = {
      name: "Cabernet",
      slug: "cabernet-2020",
      vintage: 2020,
      wineryId: "winery-1",
      regionId: "region-1",
      country: "US",
      grapeVarieties: ["Cabernet Sauvignon"],
      alcoholPercent: 13.5,
      description: "Bold",
      imageUrl: "https://example.com/wine.png"
    };

    await repository.create(input);

    expect(create).toHaveBeenCalledWith({
      data: input,
      include: {
        winery: true,
        region: true
      }
    });
  });

  it("search queries matching wine, winery, and region fields", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      wine: {
        findMany
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.search("cab");

    expect(findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "cab", mode: "insensitive" } },
          { country: { contains: "cab", mode: "insensitive" } },
          { winery: { name: { contains: "cab", mode: "insensitive" } } },
          { region: { name: { contains: "cab", mode: "insensitive" } } }
        ]
      },
      include: {
        winery: true,
        region: true
      },
      orderBy: { createdAt: "desc" }
    });
  });
});
