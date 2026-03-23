import type { WineWithInventory } from "@/repositories/wine/IWineRepository";
import type { WineVariation } from "@prisma/client";

export type WineType = "red" | "white" | "rose" | "sparkling" | "dessert" | "fortified" | "other";

export type WineListSort = "createdAt" | "name" | "priceGlass" | "priceBottle";

export type SortOrder = "asc" | "desc";

export type DefaultVariation = {
  id: string;
  name: string;
  price: number;
  volumeOz: number | null;
};

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
  defaultVariation: DefaultVariation | null;
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

export function getDefaultVariation(wine: WineWithInventory): DefaultVariation | null {
  if (wine.variations.length === 0) {
    return null;
  }

  // Priority 1: Look for 5oz public variation
  const fiveOzVariation = wine.variations.find((v) => v.isPublic && v.volumeOz === 5);
  if (fiveOzVariation) {
    return {
      id: fiveOzVariation.id,
      name: fiveOzVariation.name,
      price: Number(fiveOzVariation.price),
      volumeOz: fiveOzVariation.volumeOz
    };
  }

  // Priority 2: First public variation
  const firstPublicVariation = wine.variations.find((v) => v.isPublic);
  if (firstPublicVariation) {
    return {
      id: firstPublicVariation.id,
      name: firstPublicVariation.name,
      price: Number(firstPublicVariation.price),
      volumeOz: firstPublicVariation.volumeOz
    };
  }

  // Priority 3: Largest price variation (fallback for edge cases)
  const largestByPrice = wine.variations.reduce((max, v) => (Number(v.price) > Number(max.price) ? v : max));
  return {
    id: largestByPrice.id,
    name: largestByPrice.name,
    price: Number(largestByPrice.price),
    volumeOz: largestByPrice.volumeOz
  };
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
    },
    defaultVariation: getDefaultVariation(wine)
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
