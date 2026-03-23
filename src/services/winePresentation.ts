import type { WineWithInventory } from "@/repositories/wine/IWineRepository";

export type WineType = "red" | "white" | "rose" | "sparkling" | "dessert" | "fortified" | "other";

export type WineListSort = "createdAt" | "name" | "priceGlass" | "priceBottle";

export type SortOrder = "asc" | "desc";

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

export function inferWineType(wine: WineWithInventory): WineType {
  const grapeVarieties = Array.isArray(wine.grapeVarieties)
    ? wine.grapeVarieties.filter((value): value is string => typeof value === "string")
    : [];
  const searchableText = [wine.name, wine.description, ...grapeVarieties].join(" ").toLowerCase();

  if (matchesAny(searchableText, ["sparkling", "champagne", "prosecco", "cava"])) {
    return "sparkling";
  }

  if (matchesAny(searchableText, ["rose", "rosé"])) {
    return "rose";
  }

  if (matchesAny(searchableText, ["port", "sherry", "madeira"])) {
    return "fortified";
  }

  if (matchesAny(searchableText, ["sauternes", "ice wine", "late harvest", "tokaji", "dessert"])) {
    return "dessert";
  }

  if (matchesAny(searchableText, ["chardonnay", "sauvignon blanc", "pinot grigio", "riesling", "chenin", "albarino"])) {
    return "white";
  }

  if (matchesAny(searchableText, ["cabernet", "merlot", "pinot noir", "syrah", "shiraz", "malbec", "tempranillo", "zinfandel"])) {
    return "red";
  }

  return "other";
}

export function toWineListItem(wine: WineWithInventory): WineListItem {
  // Only consider public variations for pricing display
  const publicVariations = wine.variations.filter((variation) => variation.isPublic);
  const prices = publicVariations.map((variation) => Number(variation.price));

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
      glass: prices.length > 0 ? Math.min(...prices) : null,
      bottle: prices.length > 0 ? Math.max(...prices) : null
    }
  };
}

export function compareWineListItems(
  left: { wine: WineWithInventory; item: WineListItem },
  right: { wine: WineWithInventory; item: WineListItem },
  sort: WineListSort,
  order: SortOrder
) {
  if (sort === "createdAt") {
    return compareNumbers(left.wine.createdAt.getTime(), right.wine.createdAt.getTime(), order);
  }

  if (sort === "name") {
    return compareStrings(left.item.name, right.item.name, order);
  }

  if (sort === "priceGlass") {
    return compareNullableNumbers(left.item.pricing.glass, right.item.pricing.glass, order);
  }

  return compareNullableNumbers(left.item.pricing.bottle, right.item.pricing.bottle, order);
}

function matchesAny(searchableText: string, candidates: string[]) {
  return candidates.some((candidate) => searchableText.includes(candidate));
}

function compareNumbers(left: number, right: number, order: SortOrder) {
  return order === "asc" ? left - right : right - left;
}

function compareStrings(left: string, right: string, order: SortOrder) {
  return order === "asc" ? left.localeCompare(right) : right.localeCompare(left);
}

function compareNullableNumbers(left: number | null, right: number | null, order: SortOrder) {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  return compareNumbers(left, right, order);
}
