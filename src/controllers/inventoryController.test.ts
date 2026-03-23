import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { InventoryController } from "@/controllers/inventoryController";
import type { InventoryService } from "@/services/inventoryService";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);

  return res;
}

describe("InventoryController", () => {
  it("listInventory returns 200", async () => {
    const inventoryService = {
      getInventory: vi.fn(),
      getInventoryById: vi.fn(),
      createInventory: vi.fn(),
      updateInventory: vi.fn()
    } as unknown as InventoryService;

    vi.mocked(inventoryService.getInventory).mockResolvedValue([{ id: "i1" }]);

    const controller = new InventoryController(inventoryService);
    const res = createResponse();

    await controller.listInventory({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: "i1" }]);
  });

  it("getInventoryItem returns 200", async () => {
    const inventoryService = {
      getInventory: vi.fn(),
      getInventoryById: vi.fn(),
      createInventory: vi.fn(),
      updateInventory: vi.fn()
    } as unknown as InventoryService;

    vi.mocked(inventoryService.getInventoryById).mockResolvedValue({ id: "i1" });

    const controller = new InventoryController(inventoryService);
    const req = { params: { id: "i1" } } as unknown as Request;
    const res = createResponse();

    await controller.getInventoryItem(req, res);

    expect(inventoryService.getInventoryById).toHaveBeenCalledWith("i1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("addInventory returns 201", async () => {
    const inventoryService = {
      getInventory: vi.fn(),
      getInventoryById: vi.fn(),
      createInventory: vi.fn(),
      updateInventory: vi.fn()
    } as unknown as InventoryService;

    vi.mocked(inventoryService.createInventory).mockResolvedValue({ id: "i1" });

    const controller = new InventoryController(inventoryService);
    const req = { body: { wineId: "w1" } } as Request;
    const res = createResponse();

    await controller.addInventory(req, res);

    expect(inventoryService.createInventory).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("patchInventory returns 200", async () => {
    const inventoryService = {
      getInventory: vi.fn(),
      getInventoryById: vi.fn(),
      createInventory: vi.fn(),
      updateInventory: vi.fn()
    } as unknown as InventoryService;

    vi.mocked(inventoryService.updateInventory).mockResolvedValue({ id: "i1", sealedBottleCount: 2 });

    const controller = new InventoryController(inventoryService);
    const req = { params: { id: "i1" }, body: { sealedBottleCount: 2 } } as unknown as Request;
    const res = createResponse();

    await controller.patchInventory(req, res);

    expect(inventoryService.updateInventory).toHaveBeenCalledWith("i1", { sealedBottleCount: 2 });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
