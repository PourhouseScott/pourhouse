import { describe, expect, it, vi } from "vitest";
import { RegionRepository } from "@/repositories/region/RegionRepository";

describe("RegionRepository", () => {
  it("findMany returns regions ordered by name ascending", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      region: {
        findMany
      }
    } as never;

    const repository = new RegionRepository(prisma);

    await repository.findMany();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" }
    });
  });

  it("findById queries the region by id", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      region: {
        findUnique
      }
    } as never;

    const repository = new RegionRepository(prisma);

    await repository.findById("region-1");

    expect(findUnique).toHaveBeenCalledWith({ where: { id: "region-1" } });
  });
});
