import type { IInventoryRepository } from "@/repositories/inventory/IInventoryRepository";
import { AppError } from "@/utils/appError";

export type CreateInventoryInput = {
  wineId: string;
  locationId: string;
  sealedBottleCount: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
};

export type UpdateInventoryInput = {
  locationId?: string;
  sealedBottleCount?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
};

export class InventoryService {
  public constructor(
    private readonly inventoryRepository: IInventoryRepository
  ) { }

  public async getInventory() {
    return this.inventoryRepository.findMany();
  }

  public async getInventoryById(id: string) {
    const inventory = await this.inventoryRepository.findById(id);

    if (!inventory) {
      throw new AppError("Inventory item not found", 404);
    }

    return inventory;
  }

  public async createInventory(input: CreateInventoryInput) {
    return this.inventoryRepository.create({
      wine: { connect: { id: input.wineId } },
      locationId: input.locationId,
      sealedBottleCount: input.sealedBottleCount,
      isAvailable: input.isAvailable ?? true,
      isFeatured: input.isFeatured ?? false
    });
  }

  public async updateInventory(id: string, input: UpdateInventoryInput) {
    await this.getInventoryById(id);

    return this.inventoryRepository.update(id, input);
  }
}
