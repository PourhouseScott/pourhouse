import { describe, expect, it, vi } from "vitest";
import type { IInventoryRepository } from "@/repositories/inventory/IInventoryRepository";
import type { IWineRepository, WineWithInventory } from "@/repositories/wine/IWineRepository";
import { InventoryService, type CreateInventoryInput } from "@/services/inventoryService";
import { AppError } from "@/utils/appError";

function createService() {
  const inventoryRepository: IInventoryRepository = {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  };

  const wineRepository: IWineRepository = {
    findMany: vi.fn(),
    findByIdWithInventory: vi.fn(),
    findBySlugWithInventory: vi.fn(),
    findByUniqueNameWineryVintage: vi.fn(),
    create: vi.fn(),
    search: vi.fn()
  };

  return {
    service: new InventoryService(inventoryRepository, wineRepository),
    inventoryRepository,
    wineRepository
  };
}

const input: CreateInventoryInput = {
  wineId: "wine-1",
  locationId: "loc-1",
  priceGlass: 9,
  priceBottle: 36,
  stockQuantity: 12
};

function createWineWithInventory(): WineWithInventory {
  return {
    id: "wine-1",
    slug: "cabernet-2020",
    name: "Cabernet",
    vintage: 2020,
    wineryId: "winery-1",
    regionId: "region-1",
    country: "US",
    grapeVarieties: ["Cabernet Sauvignon"],
    alcoholPercent: 13.5,
    description: "Bold",
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
    inventory: []
  };
}

describe("InventoryService", () => {
  it("returns all inventory", async () => {
    const { service, inventoryRepository } = createService();
    const inventory = [{ id: "i1" }];

    vi.mocked(inventoryRepository.findMany).mockResolvedValue(inventory);

    await expect(service.getInventory()).resolves.toEqual(inventory);
  });

  it("returns inventory by id", async () => {
    const { service, inventoryRepository } = createService();
    const item = { id: "i1" };

    vi.mocked(inventoryRepository.findById).mockResolvedValue(item);

    await expect(service.getInventoryById("i1")).resolves.toEqual(item);
  });

  it("throws when inventory by id is missing", async () => {
    const { service, inventoryRepository } = createService();

    vi.mocked(inventoryRepository.findById).mockResolvedValue(null);

    await expect(service.getInventoryById("missing")).rejects.toEqual(
      new AppError("Inventory item not found", 404)
    );
  });

  it("creates inventory and applies default flags", async () => {
    const { service, inventoryRepository, wineRepository } = createService();
    const created = { id: "new" };

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(createWineWithInventory());
    vi.mocked(inventoryRepository.create).mockResolvedValue(created);

    await expect(service.createInventory(input)).resolves.toEqual(created);
    expect(inventoryRepository.create).toHaveBeenCalledWith({
      wine: { connect: { id: "wine-1" } },
      locationId: "loc-1",
      priceGlass: 9,
      priceBottle: 36,
      stockQuantity: 12,
      isAvailable: true,
      isFeatured: false
    });
  });

  it("throws when creating inventory for missing wine", async () => {
    const { service, wineRepository } = createService();

    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(null);

    await expect(service.createInventory(input)).rejects.toEqual(new AppError("Wine not found", 404));
  });

  it("updates inventory", async () => {
    const { service, inventoryRepository } = createService();
    const updated = { id: "i1", stockQuantity: 4 };

    vi.mocked(inventoryRepository.findById).mockResolvedValue({ id: "i1" });
    vi.mocked(inventoryRepository.update).mockResolvedValue(updated);

    await expect(service.updateInventory("i1", { stockQuantity: 4 })).resolves.toEqual(updated);
    expect(inventoryRepository.update).toHaveBeenCalledWith("i1", { stockQuantity: 4 });
  });
});
