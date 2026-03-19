import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi } from "vitest";
import type { IRegionRepository } from "@/repositories/region/IRegionRepository";
import type { IRatingRepository } from "@/repositories/rating/IRatingRepository";
import type { IWineRepository, WineWithInventory } from "@/repositories/wine/IWineRepository";
import type { IWineryRepository } from "@/repositories/winery/IWineryRepository";
import { WineService, type CreateWineInput, type ListWinesQuery } from "@/services/wineService";
import { AppError } from "@/utils/appError";

function createService() {
  const wineRepository: IWineRepository = {
    findMany: vi.fn(),
    findByIdWithInventory: vi.fn(),
    findBySlugWithInventory: vi.fn(),
    findByUniqueNameWineryVintage: vi.fn(),
    create: vi.fn(),
    search: vi.fn()
  };

  const wineryRepository: IWineryRepository = {
    findById: vi.fn()
  };

  const regionRepository: IRegionRepository = {
    findById: vi.fn()
  };

  const ratingRepository: IRatingRepository = {
    create: vi.fn(),
    findByWineId: vi.fn()
  };

  return {
    service: new WineService(wineRepository, wineryRepository, regionRepository, ratingRepository),
    wineRepository,
    wineryRepository,
    regionRepository,
    ratingRepository
  };
}

const input: CreateWineInput = {
  name: "Cabernet",
  slug: "cabernet-winery-1-2020",
  vintage: 2020,
  wineryId: "winery-1",
  regionId: "region-1",
  country: "US",
  grapeVarieties: ["Cabernet Sauvignon"],
  alcoholPercent: 13.5,
  description: "Bold",
  imageUrl: "https://example.com/wine.png"
};

function createWineWithInventory(): WineWithInventory {
  return {
    id: "w1",
    slug: "cabernet-2020",
    name: "Cabernet",
    vintage: 2020,
    wineryId: "winery-1",
    regionId: "region-1",
    country: "US",
    grapeVarieties: ["Cabernet Sauvignon"],
    alcoholPercent: 13.5,
    description: "Bold",
    imageUrl: "https://example.com/wine.png",
    squareItemId: null,
    createdAt: new Date("2026-03-19T00:00:00.000Z"),
    winery: {
      id: "winery-1",
      name: "Alpha Winery",
      regionId: "region-1",
      country: "US",
      website: "https://example.com",
      description: "Estate producer"
    },
    region: {
      id: "region-1",
      name: "Napa Valley",
      parentId: null
    },
    inventory: []
  };
}

function createWineWithRelations() {
  const { inventory, ...wine } = createWineWithInventory();

  return wine;
}

const defaultListQuery: ListWinesQuery = {
  page: 1,
  pageSize: 20,
  sort: "createdAt",
  order: "desc"
};

describe("WineService", () => {
  it("returns all wines", async () => {
    const { service, wineRepository } = createService();
    const wines: WineWithInventory[] = [
      {
        id: "w1",
        slug: "cabernet-2020",
        name: "Cabernet",
        vintage: 2020,
        wineryId: "winery-1",
        regionId: "region-1",
        country: "US",
        grapeVarieties: ["Cabernet Sauvignon"],
        alcoholPercent: 13.5,
        description: "Bold",
        imageUrl: "https://example.com/wine.png",
        squareItemId: null,
        createdAt: new Date("2026-03-19T00:00:00.000Z"),
        winery: {
          id: "winery-1",
          name: "Alpha Winery",
          regionId: "region-1",
          country: "US",
          website: "https://example.com",
          description: "Estate producer"
        },
        region: {
          id: "region-1",
          name: "Napa Valley",
          parentId: null
        },
        inventory: [
          {
            id: "inv-1",
            wineId: "w1",
            locationId: "bar-main",
            priceGlass: new Decimal(18),
            priceBottle: new Decimal(72),
            stockQuantity: 5,
            isAvailable: true,
            isFeatured: false,
            createdAt: new Date("2026-03-19T00:00:00.000Z")
          },
          {
            id: "inv-2",
            wineId: "w1",
            locationId: "bar-patio",
            priceGlass: new Decimal(16),
            priceBottle: new Decimal(68),
            stockQuantity: 3,
            isAvailable: true,
            isFeatured: true,
            createdAt: new Date("2026-03-19T00:00:00.000Z")
          }
        ]
      }
    ];

    vi.mocked(wineRepository.findMany).mockResolvedValue(wines);

    await expect(service.getWines(defaultListQuery)).resolves.toEqual({
      items: [
        {
          id: "w1",
          slug: "cabernet-2020",
          name: "Cabernet",
          vintage: 2020,
          country: "US",
          description: "Bold",
          imageUrl: "https://example.com/wine.png",
          winery: {
            id: "winery-1",
            name: "Alpha Winery"
          },
          region: {
            id: "region-1",
            name: "Napa Valley"
          },
          pricing: {
            glass: 16,
            bottle: 68
          }
        }
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1
    });
    expect(wineRepository.findMany).toHaveBeenCalledWith({});
  });

  it("returns null pricing when a wine has no available inventory rows", async () => {
    const { service, wineRepository } = createService();
    const wines: WineWithInventory[] = [
      {
        id: "w2",
        slug: "riesling-2021",
        name: "Riesling",
        vintage: 2021,
        wineryId: "winery-2",
        regionId: "region-2",
        country: "DE",
        grapeVarieties: ["Riesling"],
        alcoholPercent: 11.5,
        description: "Bright",
        imageUrl: "https://example.com/riesling.png",
        squareItemId: null,
        createdAt: new Date("2026-03-19T00:00:00.000Z"),
        winery: {
          id: "winery-2",
          name: "Mosel Cellars",
          regionId: "region-2",
          country: "DE",
          website: "https://example.com/mosel",
          description: "Steep slope producer"
        },
        region: {
          id: "region-2",
          name: "Mosel",
          parentId: null
        },
        inventory: []
      }
    ];

    vi.mocked(wineRepository.findMany).mockResolvedValue(wines);

    await expect(service.getWines(defaultListQuery)).resolves.toEqual({
      items: [
        {
          id: "w2",
          slug: "riesling-2021",
          name: "Riesling",
          vintage: 2021,
          country: "DE",
          description: "Bright",
          imageUrl: "https://example.com/riesling.png",
          winery: {
            id: "winery-2",
            name: "Mosel Cellars"
          },
          region: {
            id: "region-2",
            name: "Mosel"
          },
          pricing: {
            glass: null,
            bottle: null
          }
        }
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1
    });
  });

  it("sorts by lowest glass price ascending and paginates results", async () => {
    const { service, wineRepository } = createService();
    const firstWine = createWineWithInventory();
    firstWine.id = "w1";
    firstWine.name = "Cabernet";
    firstWine.createdAt = new Date("2026-03-19T00:00:00.000Z");
    firstWine.inventory = [
      {
        id: "inv-1",
        wineId: "w1",
        locationId: "bar-main",
        priceGlass: new Decimal(20),
        priceBottle: new Decimal(80),
        stockQuantity: 5,
        isAvailable: true,
        isFeatured: false,
        createdAt: new Date("2026-03-19T00:00:00.000Z")
      }
    ];

    const secondWine = createWineWithInventory();
    secondWine.id = "w2";
    secondWine.slug = "merlot-2021";
    secondWine.name = "Merlot";
    secondWine.createdAt = new Date("2026-03-18T00:00:00.000Z");
    secondWine.inventory = [
      {
        id: "inv-2",
        wineId: "w2",
        locationId: "bar-main",
        priceGlass: new Decimal(14),
        priceBottle: new Decimal(64),
        stockQuantity: 3,
        isAvailable: true,
        isFeatured: false,
        createdAt: new Date("2026-03-18T00:00:00.000Z")
      }
    ];

    vi.mocked(wineRepository.findMany).mockResolvedValue([firstWine, secondWine]);

    await expect(
      service.getWines({
        ...defaultListQuery,
        page: 2,
        pageSize: 1,
        sort: "priceGlass",
        order: "asc",
        country: "US",
        featuredOnly: true
      })
    ).resolves.toEqual({
      items: [
        {
          id: "w1",
          slug: "cabernet-2020",
          name: "Cabernet",
          vintage: 2020,
          country: "US",
          description: "Bold",
          imageUrl: "https://example.com/wine.png",
          winery: {
            id: "winery-1",
            name: "Alpha Winery"
          },
          region: {
            id: "region-1",
            name: "Napa Valley"
          },
          pricing: {
            glass: 20,
            bottle: 80
          }
        }
      ],
      page: 2,
      pageSize: 1,
      total: 2,
      totalPages: 2
    });
    expect(wineRepository.findMany).toHaveBeenCalledWith({
      country: "US",
      featuredOnly: true,
      hasGlass: undefined,
      hasBottle: undefined,
      regionId: undefined,
      wineryId: undefined
    });
  });

  it("applies all list filters and sorts names ascending", async () => {
    const { service, wineRepository } = createService();
    const zinfandel = createWineWithInventory();
    zinfandel.id = "w1";
    zinfandel.slug = "zinfandel-2020";
    zinfandel.name = "Zinfandel";
    zinfandel.regionId = "region-9";
    zinfandel.wineryId = "winery-9";

    const albarino = createWineWithInventory();
    albarino.id = "w2";
    albarino.slug = "albarino-2021";
    albarino.name = "Albarino";
    albarino.regionId = "region-9";
    albarino.wineryId = "winery-9";

    vi.mocked(wineRepository.findMany).mockResolvedValue([zinfandel, albarino]);

    await expect(
      service.getWines({
        page: 1,
        pageSize: 20,
        sort: "name",
        order: "asc",
        regionId: "region-9",
        wineryId: "winery-9",
        hasGlass: true,
        hasBottle: true,
        featuredOnly: false
      })
    ).resolves.toEqual({
      items: [
        {
          id: "w2",
          slug: "albarino-2021",
          name: "Albarino",
          vintage: 2020,
          country: "US",
          description: "Bold",
          imageUrl: "https://example.com/wine.png",
          winery: {
            id: "winery-1",
            name: "Alpha Winery"
          },
          region: {
            id: "region-1",
            name: "Napa Valley"
          },
          pricing: {
            glass: null,
            bottle: null
          }
        },
        {
          id: "w1",
          slug: "zinfandel-2020",
          name: "Zinfandel",
          vintage: 2020,
          country: "US",
          description: "Bold",
          imageUrl: "https://example.com/wine.png",
          winery: {
            id: "winery-1",
            name: "Alpha Winery"
          },
          region: {
            id: "region-1",
            name: "Napa Valley"
          },
          pricing: {
            glass: null,
            bottle: null
          }
        }
      ],
      page: 1,
      pageSize: 20,
      total: 2,
      totalPages: 1
    });
    expect(wineRepository.findMany).toHaveBeenCalledWith({
      regionId: "region-9",
      wineryId: "winery-9",
      featuredOnly: false,
      hasGlass: true,
      hasBottle: true
    });
  });

  it("returns totalPages as 0 when no wines match the query", async () => {
    const { service, wineRepository } = createService();

    vi.mocked(wineRepository.findMany).mockResolvedValue([]);

    await expect(service.getWines(defaultListQuery)).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0
    });
  });

  it("covers numeric, string, and nullable comparator branches", () => {
    const { service } = createService();
    const compareNumbers = service["compareNumbers"].bind(service) as (
      left: number,
      right: number,
      order: "asc" | "desc"
    ) => number;
    const compareStrings = service["compareStrings"].bind(service) as (
      left: string,
      right: string,
      order: "asc" | "desc"
    ) => number;
    const compareNullableNumbers = service["compareNullableNumbers"].bind(service) as (
      left: number | null,
      right: number | null,
      order: "asc" | "desc"
    ) => number;

    expect(compareNumbers(1, 2, "asc")).toBeLessThan(0);
    expect(compareNumbers(1, 2, "desc")).toBeGreaterThan(0);

    expect(compareStrings("Albarino", "Zinfandel", "asc")).toBeLessThan(0);
    expect(compareStrings("Albarino", "Zinfandel", "desc")).toBeGreaterThan(0);

    expect(compareNullableNumbers(null, null, "asc")).toBe(0);
    expect(compareNullableNumbers(null, 12, "asc")).toBe(1);
    expect(compareNullableNumbers(12, null, "asc")).toBe(-1);
    expect(compareNullableNumbers(10, 12, "desc")).toBeGreaterThan(0);
  });

  it("covers name and bottle sorting branches in compareWineListItems", () => {
    const { service } = createService();
    const compareWineListItems = service["compareWineListItems"].bind(service) as (
      left: { wine: WineWithInventory; item: ReturnType<WineService["toWineListItem"]> },
      right: { wine: WineWithInventory; item: ReturnType<WineService["toWineListItem"]> },
      sort: "createdAt" | "name" | "priceGlass" | "priceBottle",
      order: "asc" | "desc"
    ) => number;
    const toWineListItem = service["toWineListItem"].bind(service) as (
      wine: WineWithInventory
    ) => ReturnType<WineService["toWineListItem"]>;

    const leftWine = createWineWithInventory();
    leftWine.name = "Merlot";
    leftWine.inventory = [
      {
        id: "inv-left",
        wineId: "w1",
        locationId: "main",
        priceGlass: new Decimal(10),
        priceBottle: new Decimal(55),
        stockQuantity: 1,
        isAvailable: true,
        isFeatured: false,
        createdAt: new Date("2026-03-19T00:00:00.000Z")
      }
    ];

    const rightWine = createWineWithInventory();
    rightWine.name = "Albarino";
    rightWine.inventory = [
      {
        id: "inv-right",
        wineId: "w1",
        locationId: "main",
        priceGlass: new Decimal(11),
        priceBottle: new Decimal(60),
        stockQuantity: 1,
        isAvailable: true,
        isFeatured: false,
        createdAt: new Date("2026-03-19T00:00:00.000Z")
      }
    ];

    expect(
      compareWineListItems(
        { wine: leftWine, item: toWineListItem(leftWine) },
        { wine: rightWine, item: toWineListItem(rightWine) },
        "name",
        "desc"
      )
    ).toBeLessThan(0);

    expect(
      compareWineListItems(
        { wine: leftWine, item: toWineListItem(leftWine) },
        { wine: rightWine, item: toWineListItem(rightWine) },
        "priceBottle",
        "asc"
      )
    ).toBeLessThan(0);
  });

  it("covers the createdAt sorting branch in compareWineListItems", () => {
    const { service } = createService();
    const compareWineListItems = service["compareWineListItems"].bind(service) as (
      left: { wine: WineWithInventory; item: ReturnType<WineService["toWineListItem"]> },
      right: { wine: WineWithInventory; item: ReturnType<WineService["toWineListItem"]> },
      sort: "createdAt" | "name" | "priceGlass" | "priceBottle",
      order: "asc" | "desc"
    ) => number;
    const toWineListItem = service["toWineListItem"].bind(service) as (
      wine: WineWithInventory
    ) => ReturnType<WineService["toWineListItem"]>;

    const olderWine = createWineWithInventory();
    olderWine.createdAt = new Date("2026-03-18T00:00:00.000Z");

    const newerWine = createWineWithInventory();
    newerWine.createdAt = new Date("2026-03-19T00:00:00.000Z");

    expect(
      compareWineListItems(
        { wine: olderWine, item: toWineListItem(olderWine) },
        { wine: newerWine, item: toWineListItem(newerWine) },
        "createdAt",
        "desc"
      )
    ).toBeGreaterThan(0);
  });

  it("throws when wine by slug is missing", async () => {
    const { service, wineRepository } = createService();

    vi.mocked(wineRepository.findBySlugWithInventory).mockResolvedValue(null);

    await expect(service.getWineBySlug("missing-slug")).rejects.toEqual(new AppError("Wine not found", 404));
  });

  it("returns wine by slug when present", async () => {
    const { service, wineRepository } = createService();
    const wine = createWineWithInventory();

    vi.mocked(wineRepository.findBySlugWithInventory).mockResolvedValue(wine);

    await expect(service.getWineBySlug("cabernet-2020")).resolves.toEqual(wine);
  });

  it("creates wine when winery/region exist and duplicate does not", async () => {
    const { service, wineRepository, wineryRepository, regionRepository } = createService();
    const created = createWineWithRelations();

    vi.mocked(wineryRepository.findById).mockResolvedValue({ id: "winery-1" } as never);
    vi.mocked(regionRepository.findById).mockResolvedValue({ id: "region-1" } as never);
    vi.mocked(wineRepository.findByUniqueNameWineryVintage).mockResolvedValue(null);
    vi.mocked(wineRepository.create).mockResolvedValue(created);

    await expect(service.createWine(input)).resolves.toEqual(created);
    expect(wineRepository.create).toHaveBeenCalledWith(input);
  });

  it("throws when winery is missing", async () => {
    const { service, wineryRepository, regionRepository } = createService();

    vi.mocked(wineryRepository.findById).mockResolvedValue(null);
    vi.mocked(regionRepository.findById).mockResolvedValue({ id: "region-1" } as never);

    await expect(service.createWine(input)).rejects.toEqual(new AppError("Winery not found", 404));
  });

  it("throws when region is missing", async () => {
    const { service, wineryRepository, regionRepository } = createService();

    vi.mocked(wineryRepository.findById).mockResolvedValue({ id: "winery-1" } as never);
    vi.mocked(regionRepository.findById).mockResolvedValue(null);

    await expect(service.createWine(input)).rejects.toEqual(new AppError("Region not found", 404));
  });

  it("throws when duplicate wine exists", async () => {
    const { service, wineRepository, wineryRepository, regionRepository } = createService();

    vi.mocked(wineryRepository.findById).mockResolvedValue({ id: "winery-1" } as never);
    vi.mocked(regionRepository.findById).mockResolvedValue({ id: "region-1" } as never);
    vi.mocked(wineRepository.findByUniqueNameWineryVintage).mockResolvedValue({ id: "existing" } as never);

    await expect(service.createWine(input)).rejects.toEqual(
      new AppError("Wine with the same name, winery, and vintage already exists", 409)
    );
  });

  it("searches wines", async () => {
    const { service, wineRepository } = createService();
    const wines = [createWineWithRelations()];

    vi.mocked(wineRepository.search).mockResolvedValue(wines);

    await expect(service.searchWines("cab")).resolves.toEqual(wines);
    expect(wineRepository.search).toHaveBeenCalledWith("cab");
  });

  it("returns wine ratings for existing wine", async () => {
    const { service, wineRepository, ratingRepository } = createService();
    const ratings = [{ id: "r1" }];

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(createWineWithInventory());
    vi.mocked(ratingRepository.findByWineId).mockResolvedValue(ratings);

    await expect(service.getWineRatings("wine-1")).resolves.toEqual(ratings);
  });

  it("throws when getting ratings for missing wine", async () => {
    const { service, wineRepository } = createService();

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(null);

    await expect(service.getWineRatings("missing")).rejects.toEqual(new AppError("Wine not found", 404));
  });
});
