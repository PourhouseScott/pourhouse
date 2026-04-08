import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as adminReferenceController from "@/controllers/adminReferenceController";
import { adminReferenceService } from "@/controllers/_adminReferenceControllerDeps";

vi.mock("@/controllers/_adminReferenceControllerDeps", () => ({
  adminReferenceService: {
    listRegions: vi.fn(),
    listWineries: vi.fn()
  }
}));

describe("adminReferenceController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns admin wine options", async () => {
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    } as unknown as Response;

    vi.mocked(adminReferenceService.listRegions).mockResolvedValue([{ id: "region-1", name: "Okanagan" }]);
    vi.mocked(adminReferenceService.listWineries).mockResolvedValue([{ id: "winery-1", name: "Lightning Rock" }]);

    await adminReferenceController.listAdminWineOptions({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      regions: [{ id: "region-1", name: "Okanagan" }],
      wineries: [{ id: "winery-1", name: "Lightning Rock" }]
    });
  });

  it("returns 500 when loading options fails", async () => {
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    } as unknown as Response;

    vi.mocked(adminReferenceService.listRegions).mockRejectedValue(new Error("boom"));
    vi.mocked(adminReferenceService.listWineries).mockResolvedValue([]);

    await adminReferenceController.listAdminWineOptions({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to load admin wine options",
      details: "boom"
    });
  });

  it("returns 500 with non-Error details when rejected value is not an Error", async () => {
    const res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis()
    } as unknown as Response;

    vi.mocked(adminReferenceService.listRegions).mockRejectedValue("service down");
    vi.mocked(adminReferenceService.listWineries).mockResolvedValue([]);

    await adminReferenceController.listAdminWineOptions({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to load admin wine options",
      details: "service down"
    });
  });
});
