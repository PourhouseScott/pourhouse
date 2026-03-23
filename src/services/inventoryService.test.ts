import { describe, expect, it, vi } from "vitest";
import type { IInventoryRepository } from "@/repositories/inventory/IInventoryRepository";
import { InventoryService, type CreateInventoryInput } from "@/services/inventoryService";
import { AppError } from "@/utils/appError";

function createService() {
  const inventoryRepository: IInventoryRepository = {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  };

  return {
    service: new InventoryService(inventoryRepository),
    inventoryRepository
  };
}

const input: CreateInventoryInput = {
  wineId: "wine-1",
  locationId: "loc-1",
  sealedBottleCount: 12
};

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
    const { service, inventoryRepository } = createService();
    const created = { id: "new" };

    vi.mocked(inventoryRepository.create).mockResolvedValue(created);

    await expect(service.createInventory(input)).resolves.toEqual(created);
    expect(inventoryRepository.create).toHaveBeenCalledWith({
      wine: { connect: { id: "wine-1" } },
      locationId: "loc-1",
      sealedBottleCount: 12,
      isAvailable: true,
      isFeatured: false
    });
  });

  it("updates inventory", async () => {
    const { service, inventoryRepository } = createService();
    const updated = { id: "i1", sealedBottleCount: 4 };

    vi.mocked(inventoryRepository.findById).mockResolvedValue({ id: "i1" });
    vi.mocked(inventoryRepository.update).mockResolvedValue(updated);

    await expect(service.updateInventory("i1", { sealedBottleCount: 4 })).resolves.toEqual(updated);
    expect(inventoryRepository.update).toHaveBeenCalledWith("i1", { sealedBottleCount: 4 });
  });
});
