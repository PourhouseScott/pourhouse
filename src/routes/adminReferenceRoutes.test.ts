import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const listAdminWineOptions = vi.hoisted(() => vi.fn((_req, res) => {
  res.status(200).json({
    regions: [{ id: "region-1", name: "Napa" }],
    wineries: [{ id: "winery-1", name: "Alpha" }]
  });
}));

vi.mock("@/controllers/adminReferenceController", () => ({
  listAdminWineOptions
}));

vi.mock("@/container", () => ({
  adminAuthMiddleware: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers.authorization !== "Bearer admin-token") {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    next();
  }
}));

import router from "@/routes/adminReferenceRoutes";

describe("adminReferenceRoutes", () => {
  const app = express();
  app.use(router);

  it("rejects unauthenticated requests", async () => {
    const response = await request(app).get("/wine-options");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" });
  });

  it("routes authenticated GET /wine-options to listAdminWineOptions", async () => {
    const response = await request(app)
      .get("/wine-options")
      .set("Authorization", "Bearer admin-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      regions: [{ id: "region-1", name: "Napa" }],
      wineries: [{ id: "winery-1", name: "Alpha" }]
    });
    expect(listAdminWineOptions).toHaveBeenCalledTimes(1);
  });
});
