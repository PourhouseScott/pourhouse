import { describe, expect, it } from "vitest";
import {
  addWineToFlightSchema,
  createFlightSchema,
  createInventorySchema,
  createWineSchema,
  listFlightsQuerySchema,
  listWinesSchema,
  updateFlightSchema,
  updateInventorySchema
} from "@/models/validation";

describe("listWinesSchema", () => {
  it("applies defaults and transforms string booleans", () => {
    expect(listWinesSchema.parse({ featuredOnly: "true", hasGlass: "false" })).toEqual({
      page: 1,
      pageSize: 20,
      sort: "createdAt",
      order: "desc",
      featuredOnly: true,
      hasGlass: false
    });
  });

  it("accepts boolean query flags directly", () => {
    expect(listWinesSchema.parse({ hasBottle: true, featuredOnly: false })).toEqual({
      page: 1,
      pageSize: 20,
      sort: "createdAt",
      order: "desc",
      hasBottle: true,
      featuredOnly: false
    });
  });
});

describe("createWineSchema", () => {
  it("accepts a create payload without a slug", () => {
    expect(
      createWineSchema.parse({
        name: "Cabernet",
        vintage: 2020,
        wineryId: "11111111-1111-4111-8111-111111111111",
        regionId: "22222222-2222-4222-8222-222222222222",
        country: "US",
        grapeVarieties: ["Cabernet Sauvignon"],
        alcoholPercent: 13.5,
        description: "Bold",
        imageUrl: "https://example.com/wine.png"
      })
    ).toEqual({
      name: "Cabernet",
      vintage: 2020,
      wineryId: "11111111-1111-4111-8111-111111111111",
      regionId: "22222222-2222-4222-8222-222222222222",
      country: "US",
      grapeVarieties: ["Cabernet Sauvignon"],
      alcoholPercent: 13.5,
      description: "Bold",
      imageUrl: "https://example.com/wine.png"
    });
  });

  it("strips a client-provided slug from the payload", () => {
    expect(
      createWineSchema.parse({
        name: "Cabernet",
        slug: "ignored-by-server",
        vintage: 2020,
        wineryId: "11111111-1111-4111-8111-111111111111",
        regionId: "22222222-2222-4222-8222-222222222222",
        country: "US",
        grapeVarieties: ["Cabernet Sauvignon"],
        alcoholPercent: 13.5,
        description: "Bold",
        imageUrl: "https://example.com/wine.png"
      })
    ).toEqual({
      name: "Cabernet",
      vintage: 2020,
      wineryId: "11111111-1111-4111-8111-111111111111",
      regionId: "22222222-2222-4222-8222-222222222222",
      country: "US",
      grapeVarieties: ["Cabernet Sauvignon"],
      alcoholPercent: 13.5,
      description: "Bold",
      imageUrl: "https://example.com/wine.png"
    });
  });
});

describe("inventory schemas", () => {
  it("accepts createInventorySchema with wineId", () => {
    expect(
      createInventorySchema.parse({
        wineId: "11111111-1111-4111-8111-111111111111",
        locationId: "bar-main",
        sealedBottleCount: 10,
        isAvailable: true,
        isFeatured: false
      })
    ).toEqual({
      wineId: "11111111-1111-4111-8111-111111111111",
      locationId: "bar-main",
      sealedBottleCount: 10,
      isAvailable: true,
      isFeatured: false
    });
  });

  it("accepts updateInventorySchema without price fields", () => {
    expect(
      updateInventorySchema.parse({
        sealedBottleCount: 4,
        isAvailable: true
      })
    ).toEqual({
      sealedBottleCount: 4,
      isAvailable: true
    });
  });
});

describe("flight schemas", () => {
  it("parses list flights query with boolean string", () => {
    expect(listFlightsQuerySchema.parse({ activeOnly: "false" })).toEqual({
      activeOnly: false
    });
  });

  it("accepts create flight payload", () => {
    expect(
      createFlightSchema.parse({
        name: "Weekend Flight",
        description: "Three pours",
        isActive: true
      })
    ).toEqual({
      name: "Weekend Flight",
      description: "Three pours",
      isActive: true
    });
  });

  it("accepts update flight payload", () => {
    expect(
      updateFlightSchema.parse({
        isActive: false
      })
    ).toEqual({
      isActive: false
    });
  });

  it("accepts add wine to flight payload", () => {
    expect(
      addWineToFlightSchema.parse({
        wineId: "11111111-1111-4111-8111-111111111111",
        position: 1
      })
    ).toEqual({
      wineId: "11111111-1111-4111-8111-111111111111",
      position: 1
    });
  });
});
