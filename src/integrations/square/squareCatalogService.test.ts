import { describe, expect, it, vi } from "vitest";
import type { CatalogClient } from "square/api/resources/catalog/client/Client";
import { SquareCatalogService } from "@/integrations/square/squareCatalogService";

function makeCatalogClient(items: unknown[]) {
  const asyncIterable = {
    [Symbol.asyncIterator]: async function* () {
      for (const item of items) {
        yield item;
      }
    }
  };

  return {
    list: vi.fn().mockResolvedValue(asyncIterable)
  } as unknown as CatalogClient;
}

describe("SquareCatalogService", () => {
  it("returns empty array when catalog has no items", async () => {
    const catalogClient = makeCatalogClient([]);
    const service = new SquareCatalogService(catalogClient);

    await expect(service.fetchCatalogItems()).resolves.toEqual([]);
    expect(catalogClient.list).toHaveBeenCalledWith({ types: "ITEM,ITEM_VARIATION" });
  });

  it("returns all items from the catalog", async () => {
    const mockItems = [
      { type: "ITEM", id: "item-1" },
      { type: "ITEM_VARIATION", id: "var-1" },
      { type: "ITEM", id: "item-2" }
    ];
    const catalogClient = makeCatalogClient(mockItems);
    const service = new SquareCatalogService(catalogClient);

    await expect(service.fetchCatalogItems()).resolves.toEqual(mockItems);
  });

  it("propagates errors thrown by the catalog client", async () => {
    const catalogClient = {
      list: vi.fn().mockRejectedValue(new Error("Square API unavailable"))
    } as unknown as CatalogClient;
    const service = new SquareCatalogService(catalogClient);

    await expect(service.fetchCatalogItems()).rejects.toThrow("Square API unavailable");
  });
});
