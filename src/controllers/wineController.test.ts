import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { WineController } from "@/controllers/wineController";
import type { WineService } from "@/services/wineService";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);

  return res;
}

describe("WineController", () => {
  it("listWines returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getWineById: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.getWines).mockResolvedValue([{ id: "w1" }]);

    const controller = new WineController(wineService);
    const res = createResponse();

    await controller.listWines({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: "w1" }]);
  });

  it("getWine returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getWineById: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.getWineById).mockResolvedValue({ id: "w1" });

    const controller = new WineController(wineService);
    const req = { params: { id: "w1" } } as unknown as Request;
    const res = createResponse();

    await controller.getWine(req, res);

    expect(wineService.getWineById).toHaveBeenCalledWith("w1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("addWine returns 201", async () => {
    const wineService = {
      getWines: vi.fn(),
      getWineById: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.createWine).mockResolvedValue({ id: "w1" });

    const controller = new WineController(wineService);
    const req = { body: { name: "Cab" } } as Request;
    const res = createResponse();

    await controller.addWine(req, res);

    expect(wineService.createWine).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("searchWine returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getWineById: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.searchWines).mockResolvedValue([{ id: "w1" }]);

    const controller = new WineController(wineService);
    const req = { query: { q: "cab" } } as unknown as Request;
    const res = createResponse();

    await controller.searchWine(req, res);

    expect(wineService.searchWines).toHaveBeenCalledWith("cab");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("listWineRatings returns 200", async () => {
    const wineService = {
      getWines: vi.fn(),
      getWineById: vi.fn(),
      createWine: vi.fn(),
      searchWines: vi.fn(),
      getWineRatings: vi.fn()
    } as unknown as WineService;

    vi.mocked(wineService.getWineRatings).mockResolvedValue([{ id: "r1" }]);

    const controller = new WineController(wineService);
    const req = { params: { id: "w1" } } as unknown as Request;
    const res = createResponse();

    await controller.listWineRatings(req, res);

    expect(wineService.getWineRatings).toHaveBeenCalledWith("w1");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
