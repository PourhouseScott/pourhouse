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

export type WineType = "red" | "white" | "rose" | "sparkling" | "dessert" | "fortified" | "other";

export type GroupedWineRegion = {
  id: string;
  name: string;
  wines: WineListItem[];
};

export type GroupedWineType = {
  type: WineType;
  regions: GroupedWineRegion[];
};

export type GroupedWinesResponse = {
  groups: GroupedWineType[];
  totalWines: number;
};

export type WineListSort = "createdAt" | "name" | "priceGlass" | "priceBottle";

export type SortOrder = "asc" | "desc";

export type ListWinesQuery = WineListFilters & {
  page: number;
  pageSize: number;
  sort: WineListSort;
  order: SortOrder;
};

export type GroupedWinesQuery = WineListFilters;

export type PaginatedWineList = {
  items: WineListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

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

  public async getGroupedWines(query: GroupedWinesQuery): Promise<GroupedWinesResponse> {
    const wines = await this.wineRepository.findMany(this.toWineListFilters(query));
    const groupedByType = new Map<WineType, Map<string, GroupedWineRegion>>();

    for (const wine of wines) {
      const wineType = this.inferWineType(wine);
      const regionMap = groupedByType.get(wineType) ?? new Map<string, GroupedWineRegion>();
      const region = regionMap.get(wine.region.id) ?? {
        id: wine.region.id,
        name: wine.region.name,
        wines: []
      };

      region.wines.push(this.toWineListItem(wine));
      regionMap.set(wine.region.id, region);
      groupedByType.set(wineType, regionMap);
    }

    const typeOrder: WineType[] = ["red", "white", "rose", "sparkling", "dessert", "fortified", "other"];
    const groups = typeOrder.flatMap((wineType) => {
      const regionMap = groupedByType.get(wineType);

      if (!regionMap) {
        return [];
      }

      const regions = [...regionMap.values()]
        .map((region) => ({
          ...region,
          wines: region.wines.sort((left, right) => left.name.localeCompare(right.name))
        }))
        .sort((left, right) => left.name.localeCompare(right.name));

      return [{ type: wineType, regions }];
    });

    return {
      groups,
      totalWines: wines.length
    };
  }

  public async getWineBySlug(slug: string) {
    const wine = await this.wineRepository.findBySlugWithInventory(slug);

    if (!wine) {
      throw new AppError("Wine not found", 404);
    }

    return wine;
  }

  public async resolveWineSlugFromQrCode(code: string) {
    const trimmedCode = code.trim();

    const wineBySlug = await this.wineRepository.findBySlug(trimmedCode);

    if (wineBySlug) {
      return wineBySlug.slug;
    }

    const wineBySquareItemId = await this.wineRepository.findBySquareItemId(trimmedCode);

    if (wineBySquareItemId) {
      return wineBySquareItemId.slug;
    }

    throw new AppError("Wine not found", 404);
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

    return this.wineRepository.create({
      ...input,
      slug: await this.generateUniqueSlug(input.name, input.vintage)
    });
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

  private toWineListFilters(query: ListWinesQuery | GroupedWinesQuery): WineListFilters {
    return {
      ...(query.country !== undefined ? { country: query.country } : {}),
      ...(query.regionId !== undefined ? { regionId: query.regionId } : {}),
      ...(query.wineryId !== undefined ? { wineryId: query.wineryId } : {}),
      ...(query.featuredOnly !== undefined ? { featuredOnly: query.featuredOnly } : {}),
      ...(query.hasGlass !== undefined ? { hasGlass: query.hasGlass } : {}),
      ...(query.hasBottle !== undefined ? { hasBottle: query.hasBottle } : {})
    };
  }

  private async generateUniqueSlug(name: string, vintage: number): Promise<string> {
    const normalizedName = this.slugify(name);
    const baseSlug = normalizedName ? `${normalizedName}-${vintage}` : `wine-${vintage}`;
    let candidateSlug = baseSlug;
    let suffix = 2;

    while (await this.wineRepository.findBySlug(candidateSlug)) {
      candidateSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidateSlug;
  }

  private slugify(value: string): string {
    return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private inferWineType(wine: WineWithInventory): WineType {
    const grapeVarieties = Array.isArray(wine.grapeVarieties)
      ? wine.grapeVarieties.filter((value): value is string => typeof value === "string")
      : [];
    const searchableText = [wine.name, wine.description, ...grapeVarieties].join(" ").toLowerCase();

    if (this.matchesAny(searchableText, ["sparkling", "champagne", "prosecco", "cava"])) {
      return "sparkling";
    }

    if (this.matchesAny(searchableText, ["rose", "rosé"])) {
      return "rose";
    }

    if (this.matchesAny(searchableText, ["port", "sherry", "madeira"])) {
      return "fortified";
    }

    if (this.matchesAny(searchableText, ["sauternes", "ice wine", "late harvest", "tokaji", "dessert"])) {
      return "dessert";
    }

    if (this.matchesAny(searchableText, ["chardonnay", "sauvignon blanc", "pinot grigio", "riesling", "chenin", "albarino"])) {
      return "white";
    }

    if (this.matchesAny(searchableText, ["cabernet", "merlot", "pinot noir", "syrah", "shiraz", "malbec", "tempranillo", "zinfandel"])) {
      return "red";
    }

    return "other";
  }

  private matchesAny(searchableText: string, candidates: string[]) {
    return candidates.some((candidate) => searchableText.includes(candidate));
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
