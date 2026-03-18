import type { Wine } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { SquareWineSyncService } from "@/integrations/square/squareWineSyncService";
import type { ISquareSyncRepository, InventorySyncRow } from "@/repositories/squareSync/ISquareSyncRepository";

function createSquareSyncRepositoryMock(): ISquareSyncRepository {
  return {
    ensureSquareDefaults: vi.fn().mockResolvedValue({
      regionId: "region-square",
      wineryId: "winery-square"
    }),
    findWineBySquareItemId: vi.fn().mockResolvedValue(null),
    createWine: vi.fn().mockResolvedValue({ id: "wine-created" } as Wine),
    updateWineBySquareItemId: vi.fn().mockResolvedValue({ id: "wine-updated" } as Wine),
    replaceInventoryForWine: vi.fn().mockImplementation(async (_wineId: string, rows: InventorySyncRow[]) => rows.length)
  };
}

describe("SquareWineSyncService", () => {
  it("creates wines for new Square items and maps variations to inventory rows", async () => {
    const repository = createSquareSyncRepositoryMock();
    const service = new SquareWineSyncService(repository);

    const catalogObjects = [
      {
        type: "ITEM",
        id: "square-item-1",
        itemData: {
          name: "Reserve Cabernet",
          description: "From Square",
          variations: [
            {
              id: "square-var-1",
              itemVariationData: {
                priceMoney: {
                  amount: 1500
                }
              }
            },
            {
              id: "square-var-2",
              itemVariationData: {
                priceMoney: {
                  amount: 1800
                }
              },
              isDeleted: true
            }
          ]
        }
      }
    ] as never[];

    const result = await service.syncCatalogObjects(catalogObjects);

    expect(repository.createWine).toHaveBeenCalledTimes(1);
    expect(repository.updateWineBySquareItemId).not.toHaveBeenCalled();
    expect(result).toEqual({
      created: 1,
      updated: 0,
      skipped: 0,
      inventoryRowsSynced: 2
    });

    expect(repository.replaceInventoryForWine).toHaveBeenCalledWith("wine-created", [
      {
        locationId: "square:square-var-1",
        priceGlass: 15,
        priceBottle: 15,
        stockQuantity: 0,
        isAvailable: true,
        isFeatured: false
      },
      {
        locationId: "square:square-var-2",
        priceGlass: 18,
        priceBottle: 18,
        stockQuantity: 0,
        isAvailable: false,
        isFeatured: false
      }
    ]);
  });

  it("updates existing wine when squareItemId already exists", async () => {
    const repository = createSquareSyncRepositoryMock();
    vi.mocked(repository.findWineBySquareItemId).mockResolvedValue({ id: "wine-existing" } as Wine);

    const service = new SquareWineSyncService(repository);

    const catalogObjects = [
      {
        type: "ITEM",
        id: "square-item-existing",
        itemData: {
          name: "Existing Wine"
        }
      }
    ] as never[];

    const result = await service.syncCatalogObjects(catalogObjects);

    expect(repository.createWine).not.toHaveBeenCalled();
    expect(repository.updateWineBySquareItemId).toHaveBeenCalledTimes(1);
    expect(result.created).toBe(0);
    expect(result.updated).toBe(1);
  });

  it("deduplicates variation IDs and falls back to default row when none exist", async () => {
    const repository = createSquareSyncRepositoryMock();
    const service = new SquareWineSyncService(repository);

    const catalogObjects = [
      {
        type: "ITEM",
        id: "square-item-dedupe",
        itemData: {
          name: "Dedupe Test",
          variations: [
            {
              id: "dup-var",
              itemVariationData: {
                priceMoney: {
                  amount: 1200
                }
              }
            }
          ]
        }
      },
      {
        type: "ITEM_VARIATION",
        id: "dup-var",
        itemVariationData: {
          itemId: "square-item-dedupe",
          priceMoney: {
            amount: 1200
          }
        }
      },
      {
        type: "ITEM",
        id: "square-item-no-variation",
        itemData: {
          name: "No Variation Item"
        }
      }
    ] as never[];

    const result = await service.syncCatalogObjects(catalogObjects);

    expect(repository.createWine).toHaveBeenCalledTimes(2);
    expect(result.inventoryRowsSynced).toBe(2);

    const firstCallRows = vi.mocked(repository.replaceInventoryForWine).mock.calls[0]?.[1];
    const secondCallRows = vi.mocked(repository.replaceInventoryForWine).mock.calls[1]?.[1];

    expect(firstCallRows).toEqual([
      {
        locationId: "square:dup-var",
        priceGlass: 12,
        priceBottle: 12,
        stockQuantity: 0,
        isAvailable: true,
        isFeatured: false
      }
    ]);

    expect(secondCallRows).toEqual([
      {
        locationId: "square:square-item-no-variation-default",
        priceGlass: 0,
        priceBottle: 0,
        stockQuantity: 0,
        isAvailable: true,
        isFeatured: false
      }
    ]);
  });

  it("skips malformed item with empty id and empty name", async () => {
    const repository = createSquareSyncRepositoryMock();
    const service = new SquareWineSyncService(repository);

    const catalogObjects = [
      {
        type: "ITEM",
        id: "square-item-malformed",
        itemData: {
          name: ""
        }
      }
    ] as never[];

    const result = await service.syncCatalogObjects(catalogObjects);

    expect(result).toEqual({
      created: 0,
      updated: 0,
      skipped: 1,
      inventoryRowsSynced: 0
    });
    expect(repository.createWine).not.toHaveBeenCalled();
    expect(repository.updateWineBySquareItemId).not.toHaveBeenCalled();
    expect(repository.replaceInventoryForWine).not.toHaveBeenCalled();
  });

  it("ignores item variation rows that are missing itemId", async () => {
    const repository = createSquareSyncRepositoryMock();
    const service = new SquareWineSyncService(repository);

    const catalogObjects = [
      {
        type: "ITEM_VARIATION",
        id: "variation-without-item",
        itemVariationData: {
          priceMoney: {
            amount: 999
          }
        }
      }
    ] as never[];

    const result = await service.syncCatalogObjects(catalogObjects);

    expect(result).toEqual({
      created: 0,
      updated: 0,
      skipped: 0,
      inventoryRowsSynced: 0
    });
    expect(repository.createWine).not.toHaveBeenCalled();
    expect(repository.updateWineBySquareItemId).not.toHaveBeenCalled();
    expect(repository.replaceInventoryForWine).not.toHaveBeenCalled();
  });

  it("applies fallback parsing rules for missing fields and slug normalization", async () => {
    const repository = createSquareSyncRepositoryMock();
    const service = new SquareWineSyncService(repository);

    const catalogObjects = [
      {
        type: "ITEM",
        id: "SQUARE-UPPER-1"
      },
      {
        type: "ITEM",
        id: "square-item-punct",
        itemData: {
          name: "!!!",
          variations: [
            {
              isDeleted: false
            }
          ]
        }
      },
      {
        type: "ITEM_VARIATION",
        itemVariationData: {
          itemId: "square-item-without-parent"
        },
        isDeleted: true
      }
    ] as never[];

    const result = await service.syncCatalogObjects(catalogObjects);

    expect(result).toEqual({
      created: 2,
      updated: 0,
      skipped: 0,
      inventoryRowsSynced: 2
    });

    const createCalls = vi.mocked(repository.createWine).mock.calls;
    expect(createCalls[0]?.[0]).toMatchObject({
      name: "Unnamed Square Item",
      description: "Imported from Square catalog.",
      slug: "unnamed-square-item-square-upper-1"
    });
    expect(createCalls[1]?.[0]).toMatchObject({
      name: "!!!",
      slug: "square-item-square-item-punct"
    });

    const secondInventoryRows = vi.mocked(repository.replaceInventoryForWine).mock.calls[1]?.[1];
    expect(secondInventoryRows).toEqual([
      {
        locationId: "square:square-item-punct-variation",
        priceGlass: 0,
        priceBottle: 0,
        stockQuantity: 0,
        isAvailable: true,
        isFeatured: false
      }
    ]);
  });
});
