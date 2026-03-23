import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import type { WineWithInventory } from "@/repositories/wine/IWineRepository";
import { compareWineListItems, inferWineType, toWineListItem } from "@/services/winePresentation";

function createWine(overrides: Partial<WineWithInventory> = {}): WineWithInventory {
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
    description: "Bold red",
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
    variations: [
      {
        id: "var-1",
        wineId: "w1",
        squareVariationId: null,
        name: "5oz",
        price: new Decimal(15),
        volumeOz: 5,
        isPublic: true,
        isDefault: false,
        createdAt: new Date("2026-03-19T00:00:00.000Z"),
        inventory: []
      },
      {
        id: "var-2",
        wineId: "w1",
        squareVariationId: null,
        name: "9oz",
        price: new Decimal(24),
        volumeOz: 9,
        isPublic: true,
        isDefault: true,
        createdAt: new Date("2026-03-19T00:00:00.000Z"),
        inventory: []
      }
    ],
    ...overrides
  };
}

describe("winePresentation", () => {
  it("classifies all wine type branches", () => {
    expect(inferWineType(createWine({ name: "Prosecco" }))).toBe("sparkling");
    expect(inferWineType(createWine({ name: "Rose" }))).toBe("rose");
    expect(inferWineType(createWine({ description: "Aged Port" }))).toBe("fortified");
    expect(inferWineType(createWine({ description: "Late harvest dessert" }))).toBe("dessert");
    expect(inferWineType(createWine({ grapeVarieties: ["Chardonnay"] }))).toBe("white");
    expect(inferWineType(createWine({ grapeVarieties: ["Merlot"] }))).toBe("red");
    expect(inferWineType(createWine({ name: "Mystery", description: "Unknown", grapeVarieties: ["Hybrid"] }))).toBe("other");
  });

  it("maps wine list item pricing from variation prices", () => {
    const item = toWineListItem(createWine());

    expect(item.pricing).toEqual({ glass: 15, bottle: 24 });
  });

  it("returns null pricing when there are no variations", () => {
    const item = toWineListItem(createWine({ variations: [] }));

    expect(item.pricing).toEqual({ glass: null, bottle: null });
  });

  it("compares createdAt and name sorts", () => {
    const older = createWine({ id: "w1", name: "Merlot", createdAt: new Date("2026-03-18T00:00:00.000Z") });
    const newer = createWine({ id: "w2", name: "Albarino", createdAt: new Date("2026-03-19T00:00:00.000Z") });

    const olderItem = toWineListItem(older);
    const newerItem = toWineListItem(newer);

    expect(compareWineListItems({ wine: older, item: olderItem }, { wine: newer, item: newerItem }, "createdAt", "asc")).toBeLessThan(0);
    expect(compareWineListItems({ wine: older, item: olderItem }, { wine: newer, item: newerItem }, "name", "desc")).toBeLessThan(0);
  });

  it("covers nullable and numeric price comparisons", () => {
    const nullPriceWine = createWine({ id: "w-null", variations: [] });
    const lowPriceWine = createWine({ id: "w-low", variations: [
      {
        id: "var-low",
        wineId: "w-low",
        squareVariationId: null,
        name: "5oz",
        price: new Decimal(10),
        volumeOz: 5,
        isPublic: true,
        isDefault: true,
        createdAt: new Date("2026-03-19T00:00:00.000Z"),
        inventory: []
      }
    ] });
    const highPriceWine = createWine({ id: "w-high", variations: [
      {
        id: "var-high",
        wineId: "w-high",
        squareVariationId: null,
        name: "9oz",
        price: new Decimal(30),
        volumeOz: 9,
        isPublic: true,
        isDefault: true,
        createdAt: new Date("2026-03-19T00:00:00.000Z"),
        inventory: []
      }
    ] });

    const nullItem = toWineListItem(nullPriceWine);
    const lowItem = toWineListItem(lowPriceWine);
    const highItem = toWineListItem(highPriceWine);

    expect(compareWineListItems({ wine: nullPriceWine, item: nullItem }, { wine: nullPriceWine, item: nullItem }, "priceGlass", "asc")).toBe(0);
    expect(compareWineListItems({ wine: nullPriceWine, item: nullItem }, { wine: lowPriceWine, item: lowItem }, "priceGlass", "asc")).toBe(1);
    expect(compareWineListItems({ wine: lowPriceWine, item: lowItem }, { wine: nullPriceWine, item: nullItem }, "priceGlass", "asc")).toBe(-1);
    expect(compareWineListItems({ wine: lowPriceWine, item: lowItem }, { wine: highPriceWine, item: highItem }, "priceGlass", "asc")).toBeLessThan(0);
    expect(compareWineListItems({ wine: lowPriceWine, item: lowItem }, { wine: highPriceWine, item: highItem }, "priceBottle", "desc")).toBeGreaterThan(0);
  });

  it("filters out non-public variations from pricing", () => {
    const wine = createWine({
      variations: [
        {
          id: "var-private",
          wineId: "w1",
          squareVariationId: null,
          name: "2oz (Internal)",
          price: new Decimal(8),
          volumeOz: 2,
          isPublic: false,
          isDefault: false,
          createdAt: new Date("2026-03-19T00:00:00.000Z"),
          inventory: []
        },
        {
          id: "var-public-5oz",
          wineId: "w1",
          squareVariationId: null,
          name: "5oz",
          price: new Decimal(15),
          volumeOz: 5,
          isPublic: true,
          isDefault: false,
          createdAt: new Date("2026-03-19T00:00:00.000Z"),
          inventory: []
        },
        {
          id: "var-public-9oz",
          wineId: "w1",
          squareVariationId: null,
          name: "9oz",
          price: new Decimal(24),
          volumeOz: 9,
          isPublic: true,
          isDefault: true,
          createdAt: new Date("2026-03-19T00:00:00.000Z"),
          inventory: []
        }
      ]
    });

    const item = toWineListItem(wine);

    // Should exclude the $8 private variation and only consider 15 and 24
    expect(item.pricing.glass).toBe(15);
    expect(item.pricing.bottle).toBe(24);
  });

  it("returns null pricing when only non-public variations exist", () => {
    const wine = createWine({
      variations: [
        {
          id: "var-private-only",
          wineId: "w1",
          squareVariationId: null,
          name: "2oz (Internal)",
          price: new Decimal(8),
          volumeOz: 2,
          isPublic: false,
          isDefault: false,
          createdAt: new Date("2026-03-19T00:00:00.000Z"),
          inventory: []
        }
      ]
    });

    const item = toWineListItem(wine);

    expect(item.pricing).toEqual({ glass: null, bottle: null });
  });
});
