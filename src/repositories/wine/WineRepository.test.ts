import { describe, expect, it, vi } from "vitest";
import { WineRepository } from "@/repositories/wine/WineRepository";

describe("WineRepository", () => {
  it("findMany returns only wines with public variations", async () => {
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
        AND: [
          {
            variations: {
              some: {
                isPublic: true
              }
            }
          }
        ]
      },
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
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("findMany applies wine and variation filters", async () => {
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
            isFeatured: true
          }
        },
        AND: [
          {
            variations: {
              some: {
                isPublic: true
              }
            }
          },
          {
            variations: {
              some: {
                servingModeConfig: {
                  is: {
                    servingMode: {
                      in: ["GLASS_5OZ", "GLASS_9OZ"]
                    },
                    isAvailable: true
                  }
                }
              }
            }
          },
          {
            variations: {
              some: {
                servingModeConfig: {
                  is: {
                    servingMode: "BOTTLE_750ML",
                    isAvailable: true
                  }
                }
              }
            }
          }
        ]
      },
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
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("findMany applies negative hasGlass and hasBottle filters", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      wine: {
        findMany
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findMany({
      hasGlass: false,
      hasBottle: false
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            variations: {
              some: {
                isPublic: true
              }
            }
          },
          {
            NOT: {
              variations: {
                some: {
                  servingModeConfig: {
                    is: {
                      servingMode: {
                        in: ["GLASS_5OZ", "GLASS_9OZ"]
                      },
                      isAvailable: true
                    }
                  }
                }
              }
            }
          },
          {
            NOT: {
              variations: {
                some: {
                  servingModeConfig: {
                    is: {
                      servingMode: "BOTTLE_750ML",
                      isAvailable: true
                    }
                  }
                }
              }
            }
          }
        ]
      },
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
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("findByIdWithInventory requests winery, region, and variations", async () => {
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
  });

  it("findBySlug queries the unique slug", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      wine: {
        findUnique
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findBySlug("cabernet-2020");

    expect(findUnique).toHaveBeenCalledWith({
      where: { slug: "cabernet-2020" }
    });
  });

  it("findBySquareItemId queries the unique Square item id", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      wine: {
        findUnique
      }
    } as never;

    const repository = new WineRepository(prisma);

    await repository.findBySquareItemId("square-item-1");

    expect(findUnique).toHaveBeenCalledWith({
      where: { squareItemId: "square-item-1" }
    });
  });

  it("findBySlugWithInventory requests winery, region, and variations", async () => {
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

  it("update calls prisma.wine.update with correct args", async () => {
    const update = vi.fn().mockResolvedValue({ id: "wine-1", name: "Updated Wine" });
    const prisma = { wine: { update } } as never;
    const repository = new WineRepository(prisma);
    const result = await repository.update("wine-1", { name: "Updated Wine" });
    expect(update).toHaveBeenCalledWith({
      where: { id: "wine-1" },
      data: { name: "Updated Wine" },
      include: { winery: true, region: true }
    });
    expect(result).toEqual({ id: "wine-1", name: "Updated Wine" });
  });

  it("delete calls prisma.wine.delete with correct args", async () => {
    const deleteFn = vi.fn().mockResolvedValue(undefined);
    const prisma = { wine: { delete: deleteFn } } as never;
    const repository = new WineRepository(prisma);
    await repository.delete("wine-1");
    expect(deleteFn).toHaveBeenCalledWith({ where: { id: "wine-1" } });
  });
});
