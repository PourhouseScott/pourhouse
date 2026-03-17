import type { IRegionRepository } from "@/repositories/region/IRegionRepository";
import type { IRatingRepository } from "@/repositories/rating/IRatingRepository";
import type { IWineRepository } from "@/repositories/wine/IWineRepository";
import type { IWineryRepository } from "@/repositories/winery/IWineryRepository";
import { AppError } from "@/utils/appError";

export type CreateWineInput = {
  name: string;
  vintage: number;
  wineryId: string;
  regionId: string;
  country: string;
  grapeVarieties: string[];
  alcoholPercent: number;
  description: string;
  imageUrl: string;
};

export class WineService {
  public constructor(
    private readonly wineRepository: IWineRepository,
    private readonly wineryRepository: IWineryRepository,
    private readonly regionRepository: IRegionRepository,
    private readonly ratingRepository: IRatingRepository
  ) { }

  public async getWines() {
    return this.wineRepository.findMany();
  }

  public async getWineById(id: string) {
    const wine = await this.wineRepository.findByIdWithInventory(id);

    if (!wine) {
      throw new AppError("Wine not found", 404);
    }

    return wine;
  }

  public async createWine(input: CreateWineInput) {
    const winery = await this.wineryRepository.findById(input.wineryId);
    const region = await this.regionRepository.findById(input.regionId);

    if (!winery) {
      throw new AppError("Winery not found", 404);
    }

    if (!region) {
      throw new AppError("Region not found", 404);
    }

    const existingWine = await this.wineRepository.findByUniqueNameWineryVintage({
      name: input.name,
      wineryId: input.wineryId,
      vintage: input.vintage
    });

    if (existingWine) {
      throw new AppError("Wine with the same name, winery, and vintage already exists", 409);
    }

    return this.wineRepository.create(input);
  }

  public async searchWines(query: string) {
    return this.wineRepository.search(query);
  }

  public async getWineRatings(wineId: string) {
    const wine = await this.wineRepository.findByIdWithInventory(wineId);

    if (!wine) {
      throw new AppError("Wine not found", 404);
    }

    return this.ratingRepository.findByWineId(wineId);
  }
}
