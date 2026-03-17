import { describe, expect, it, vi } from "vitest";
import type { IRatingRepository } from "@/repositories/rating/IRatingRepository";
import type { IWineRepository } from "@/repositories/wine/IWineRepository";
import { RatingService } from "@/services/ratingService";
import { AppError } from "@/utils/appError";

function createService() {
  const ratingRepository: IRatingRepository = {
    create: vi.fn(),
    findByWineId: vi.fn()
  };

  const wineRepository: IWineRepository = {
    findMany: vi.fn(),
    findByIdWithInventory: vi.fn(),
    findByUniqueNameWineryVintage: vi.fn(),
    create: vi.fn(),
    search: vi.fn()
  };

  return {
    service: new RatingService(ratingRepository, wineRepository),
    ratingRepository,
    wineRepository
  };
}

describe("RatingService", () => {
  it("creates rating when input is valid", async () => {
    const { service, ratingRepository, wineRepository } = createService();
    const created = { id: "rating-1" };

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue({ id: "wine-1" });
    vi.mocked(ratingRepository.create).mockResolvedValue(created);

    await expect(
      service.createRating({
        userId: "user-1",
        wineId: "wine-1",
        rating: 4,
        notes: "Great"
      })
    ).resolves.toEqual(created);

    expect(ratingRepository.create).toHaveBeenCalledWith({
      user: { connect: { id: "user-1" } },
      wine: { connect: { id: "wine-1" } },
      rating: 4,
      notes: "Great"
    });
  });

  it("throws for rating below range", async () => {
    const { service } = createService();

    await expect(
      service.createRating({
        userId: "user-1",
        wineId: "wine-1",
        rating: 0,
        notes: "Bad"
      })
    ).rejects.toEqual(new AppError("Rating must be between 1 and 5", 400));
  });

  it("throws when wine is missing", async () => {
    const { service, wineRepository } = createService();

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(null);

    await expect(
      service.createRating({
        userId: "user-1",
        wineId: "missing",
        rating: 3,
        notes: "Ok"
      })
    ).rejects.toEqual(new AppError("Wine not found", 404));
  });
});
