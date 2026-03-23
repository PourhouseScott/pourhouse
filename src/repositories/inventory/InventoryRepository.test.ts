import { describe, expect, it, vi } from "vitest";
import { InventoryRepository } from "@/repositories/inventory/InventoryRepository";

describe("InventoryRepository", () => {
  it("findMany includes wine, winery, and region data", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      inventory: {
        findMany
      }
    } as never;

    const repository = new InventoryRepository(prisma);

    await repository.findMany();

    expect(findMany).toHaveBeenCalledWith({
      include: {
        wine: {
          include: {
            winery: true,
            region: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("findById includes wine, winery, and region data", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      inventory: {
        findUnique
      }
    } as never;

    const repository = new InventoryRepository(prisma);

    await repository.findById("inventory-1");

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "inventory-1" },
      include: {
        wine: {
          include: {
            winery: true,
            region: true
          }
        }
      }
    });
  });

  it("create includes the related wine", async () => {
    const create = vi.fn().mockResolvedValue(null);
    const prisma = {
      inventory: {
        create
      }
    } as never;

    const repository = new InventoryRepository(prisma);
    const input = {
      wine: { connect: { id: "wine-1" } },
      locationId: "bar-main",
      sealedBottleCount: 5,
      isAvailable: true,
      isFeatured: false
    };

    await repository.create(input);

    expect(create).toHaveBeenCalledWith({
      data: input,
      include: {
        wine: true
      }
    });
  });

  it("update includes the related wine", async () => {
    const update = vi.fn().mockResolvedValue(null);
    const prisma = {
      inventory: {
        update
      }
    } as never;

    const repository = new InventoryRepository(prisma);
    const input = {
      sealedBottleCount: 3,
      isAvailable: false
    };

    await repository.update("inventory-1", input);

    expect(update).toHaveBeenCalledWith({
      where: { id: "inventory-1" },
      data: input,
      include: {
        wine: true
      }
    });
  });
});
