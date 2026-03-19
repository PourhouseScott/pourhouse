import type { IRegionRepository } from "@/repositories/region/IRegionRepository";
import type { IRatingRepository } from "@/repositories/rating/IRatingRepository";
import type { IWineRepository, WineListFilters, WineWithInventory } from "@/repositories/wine/IWineRepository";
import type { IWineryRepository } from "@/repositories/winery/IWineryRepository";
import { AppError } from "@/utils/appError";

export type WineListItem = {
  id: string;
  slug: string;
  name: string;
  vintage: number;
  country: string;
  description: string;
  imageUrl: string;
  winery: {
    id: string;
    name: string;
  };
  region: {
    id: string;
    name: string;
  };
  pricing: {
    glass: number | null;
    bottle: number | null;
  };
};

export type WineListSort = "createdAt" | "name" | "priceGlass" | "priceBottle";

export type SortOrder = "asc" | "desc";

export type ListWinesQuery = WineListFilters & {
  page: number;
  pageSize: number;
  sort: WineListSort;
  order: SortOrder;
};

export type PaginatedWineList = {
  items: WineListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CreateWineInput = {
  name: string;
  slug: string;
  vintage: number;
  wineryId: string;
  regionId: string;
  country: string;
  grapeVarieties: string[];
  alcoholPercent: number;
  description: string;
  imageUrl: string;
  squareItemId?: string | null;
};

export class WineService {
  public constructor(
    private readonly wineRepository: IWineRepository,
    private readonly wineryRepository: IWineryRepository,
    private readonly regionRepository: IRegionRepository,
    private readonly ratingRepository: IRatingRepository
  ) { }

  public async getWines(query: ListWinesQuery): Promise<PaginatedWineList> {
    const wines = await this.wineRepository.findMany(this.toWineListFilters(query));
    const sortableWines = wines.map((wine) => ({
      wine,
      item: this.toWineListItem(wine)
    }));

    sortableWines.sort((left, right) => this.compareWineListItems(left, right, query.sort, query.order));

    const total = sortableWines.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);
    const startIndex = (query.page - 1) * query.pageSize;
    const items = sortableWines.slice(startIndex, startIndex + query.pageSize).map((entry) => entry.item);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages
    };
  }

  public async getWineBySlug(slug: string) {
    const wine = await this.wineRepository.findBySlugWithInventory(slug);

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

  private toWineListFilters(query: ListWinesQuery): WineListFilters {
    return {
      ...(query.country !== undefined ? { country: query.country } : {}),
      ...(query.regionId !== undefined ? { regionId: query.regionId } : {}),
      ...(query.wineryId !== undefined ? { wineryId: query.wineryId } : {}),
      ...(query.featuredOnly !== undefined ? { featuredOnly: query.featuredOnly } : {}),
      ...(query.hasGlass !== undefined ? { hasGlass: query.hasGlass } : {}),
      ...(query.hasBottle !== undefined ? { hasBottle: query.hasBottle } : {})
    };
  }

  private compareWineListItems(
    left: { wine: WineWithInventory; item: WineListItem },
    right: { wine: WineWithInventory; item: WineListItem },
    sort: WineListSort,
    order: SortOrder
  ) {
    if (sort === "createdAt") {
      return this.compareNumbers(left.wine.createdAt.getTime(), right.wine.createdAt.getTime(), order);
    }

    if (sort === "name") {
      return this.compareStrings(left.item.name, right.item.name, order);
    }

    if (sort === "priceGlass") {
      return this.compareNullableNumbers(left.item.pricing.glass, right.item.pricing.glass, order);
    }

    return this.compareNullableNumbers(left.item.pricing.bottle, right.item.pricing.bottle, order);
  }

  private compareNumbers(left: number, right: number, order: SortOrder) {
    return order === "asc" ? left - right : right - left;
  }

  private compareStrings(left: string, right: string, order: SortOrder) {
    return order === "asc" ? left.localeCompare(right) : right.localeCompare(left);
  }

  private compareNullableNumbers(left: number | null, right: number | null, order: SortOrder) {
    if (left === null && right === null) {
      return 0;
    }

    if (left === null) {
      return 1;
    }

    if (right === null) {
      return -1;
    }

    return this.compareNumbers(left, right, order);
  }

  private toWineListItem(wine: WineWithInventory): WineListItem {
    const glassPrices = wine.inventory.map((item) => Number(item.priceGlass));
    const bottlePrices = wine.inventory.map((item) => Number(item.priceBottle));

    return {
      id: wine.id,
      slug: wine.slug,
      name: wine.name,
      vintage: wine.vintage,
      country: wine.country,
      description: wine.description,
      imageUrl: wine.imageUrl,
      winery: {
        id: wine.winery.id,
        name: wine.winery.name
      },
      region: {
        id: wine.region.id,
        name: wine.region.name
      },
      pricing: {
        glass: glassPrices.length > 0 ? Math.min(...glassPrices) : null,
        bottle: bottlePrices.length > 0 ? Math.min(...bottlePrices) : null
      }
    };
  }
}
