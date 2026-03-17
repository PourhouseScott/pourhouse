import { describe, expect, it, vi } from "vitest";
import type { IRegionRepository } from "@/repositories/region/IRegionRepository";
import type { IRatingRepository } from "@/repositories/rating/IRatingRepository";
import type { IWineRepository } from "@/repositories/wine/IWineRepository";
import type { IWineryRepository } from "@/repositories/winery/IWineryRepository";
import { WineService, type CreateWineInput } from "@/services/wineService";
import { AppError } from "@/utils/appError";

function createService() {
  const wineRepository: IWineRepository = {
    findMany: vi.fn(),
    findByIdWithInventory: vi.fn(),
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
  vintage: 2020,
  wineryId: "winery-1",
  regionId: "region-1",
  country: "US",
  grapeVarieties: ["Cabernet Sauvignon"],
  alcoholPercent: 13.5,
  description: "Bold",
  imageUrl: "https://example.com/wine.png"
};

describe("WineService", () => {
  it("returns all wines", async () => {
    const { service, wineRepository } = createService();
    const wines = [{ id: "w1" }];

    vi.mocked(wineRepository.findMany).mockResolvedValue(wines);

    await expect(service.getWines()).resolves.toEqual(wines);
  });

  it("throws when wine by id is missing", async () => {
    const { service, wineRepository } = createService();

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(null);

    await expect(service.getWineById("missing")).rejects.toEqual(new AppError("Wine not found", 404));
  });

  it("returns wine by id when present", async () => {
    const { service, wineRepository } = createService();
    const wine = { id: "wine-1" };

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(wine);

    await expect(service.getWineById("wine-1")).resolves.toEqual(wine);
  });

  it("creates wine when winery/region exist and duplicate does not", async () => {
    const { service, wineRepository, wineryRepository, regionRepository } = createService();
    const created = { id: "wine-1" };

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
    const wines = [{ id: "w1" }];

    vi.mocked(wineRepository.search).mockResolvedValue(wines);

    await expect(service.searchWines("cab")).resolves.toEqual(wines);
    expect(wineRepository.search).toHaveBeenCalledWith("cab");
  });

  it("returns wine ratings for existing wine", async () => {
    const { service, wineRepository, ratingRepository } = createService();
    const ratings = [{ id: "r1" }];

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue({ id: "wine-1" });
    vi.mocked(ratingRepository.findByWineId).mockResolvedValue(ratings);

    await expect(service.getWineRatings("wine-1")).resolves.toEqual(ratings);
  });

  it("throws when getting ratings for missing wine", async () => {
    const { service, wineRepository } = createService();

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(null);

    await expect(service.getWineRatings("missing")).rejects.toEqual(new AppError("Wine not found", 404));
  });
});
