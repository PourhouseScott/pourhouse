import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { WineController } from "@/controllers/wineController";
import type { ListWinesQuery } from "@/services/wineService";
import type { WineService } from "@/services/wineService";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    redirect: vi.fn()
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);

  return res;
}

function createWineWithRelations() {
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
    }
  };
}

function createWineWithInventory() {
  return {
    ...createWineWithRelations(),
    variations: []
  };
}

describe("WineController", () => {
  it("listWines returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getGroupedWines: vi.fn(),
      getWineBySlug: vi.fn(),
      resolveWineSlugFromQrCode: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    const query: ListWinesQuery = {
      page: 2,
      pageSize: 10,
      sort: "name",
      order: "asc",
      country: "US",
      featuredOnly: true
    };

    vi.mocked(wineService.getWines).mockResolvedValue({
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
          },
          defaultVariation: null
        }
      ],
      page: 2,
      pageSize: 10,
      total: 12,
      totalPages: 2
    });

    const controller = new WineController(wineService);
    const res = createResponse();

    await controller.listWines({ query } as unknown as Request, res);

    expect(wineService.getWines).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
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
          },
          defaultVariation: null
        }
      ],
      page: 2,
      pageSize: 10,
      total: 12,
      totalPages: 2
    });
  });

  it("getWine returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getGroupedWines: vi.fn(),
      getWineBySlug: vi.fn(),
      resolveWineSlugFromQrCode: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.getWineBySlug).mockResolvedValue(createWineWithInventory());

    const controller = new WineController(wineService);
    const req = { params: { slug: "cabernet-2020" } } as unknown as Request;
    const res = createResponse();

    await controller.getWine(req, res);

    expect(wineService.getWineBySlug).toHaveBeenCalledWith("cabernet-2020");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("addWine returns 201", async () => {
    const wineService = {
      getWines: vi.fn(),
      getGroupedWines: vi.fn(),
      getWineBySlug: vi.fn(),
      resolveWineSlugFromQrCode: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.createWine).mockResolvedValue(createWineWithRelations());

    const controller = new WineController(wineService);
    const req = { body: { name: "Cab" } } as Request;
    const res = createResponse();

    await controller.addWine(req, res);

    expect(wineService.createWine).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("searchWine returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getGroupedWines: vi.fn(),
      getWineBySlug: vi.fn(),
      resolveWineSlugFromQrCode: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.searchWines).mockResolvedValue([createWineWithRelations()]);

    const controller = new WineController(wineService);
    const req = { query: { q: "cab" } } as unknown as Request;
    const res = createResponse();

    await controller.searchWine(req, res);

    expect(wineService.searchWines).toHaveBeenCalledWith("cab");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("listWineRatings returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getGroupedWines: vi.fn(),
      getWineBySlug: vi.fn(),
      resolveWineSlugFromQrCode: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.getWineRatings).mockResolvedValue([{ id: "r1" }]);

    const controller = new WineController(wineService);
    const req = { params: { id: "w1" } } as unknown as Request;
    const res = createResponse();

    await controller.listWineRatings(req, res);

    expect(wineService.getWineRatings).toHaveBeenCalledWith("w1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("listGroupedWines returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getGroupedWines: vi.fn(),
      getWineBySlug: vi.fn(),
      resolveWineSlugFromQrCode: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.getGroupedWines).mockResolvedValue({
      groups: [
        {
          type: "red",
          regions: [
            {
              id: "region-1",
              name: "Napa Valley",
              wines: [
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
                  },
                  defaultVariation: null
                }
              ]
            }
          ]
        }
      ],
      totalWines: 1
    });

    const controller = new WineController(wineService);
    const res = createResponse();
    const query = { featuredOnly: true };

    await controller.listGroupedWines({ query } as unknown as Request, res);

    expect(wineService.getGroupedWines).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("redirectFromQrCode returns 302 redirect to the frontend wine detail page", async () => {
    const wineService = {
      getWines: vi.fn(),
      getGroupedWines: vi.fn(),
      getWineBySlug: vi.fn(),
      resolveWineSlugFromQrCode: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.resolveWineSlugFromQrCode).mockResolvedValue("cabernet-2020");

    const controller = new WineController(wineService);
    const req = { params: { code: "DMVG33OSRXJXM2DOH2WRQUJ4" } } as unknown as Request;
    const res = createResponse();

    await controller.redirectFromQrCode(req, res);

    expect(wineService.resolveWineSlugFromQrCode).toHaveBeenCalledWith("DMVG33OSRXJXM2DOH2WRQUJ4");
    expect(res.redirect).toHaveBeenCalledWith(302, "/wines/cabernet-2020");
  });
});
