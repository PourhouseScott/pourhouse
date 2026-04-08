import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const {
  listWines,
  createWine,
  updateWine,
  deleteWine
} = vi.hoisted(() => ({
  listWines: vi.fn((_req, res) => {
    res.status(200).json([{ id: "wine-1" }]);
  }),
  createWine: vi.fn((_req, res) => {
    res.status(201).json({ id: "wine-2" });
  }),
  updateWine: vi.fn((_req, res) => {
    res.status(200).json({ id: "wine-3" });
  }),
  deleteWine: vi.fn((_req, res) => {
    res.status(204).send();
  })
}));

vi.mock("@/controllers/adminWineController", () => ({
  listWines,
  createWine,
  updateWine,
  deleteWine
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

import router from "@/routes/adminWineRoutes";

describe("adminWineRoutes", () => {
  const app = express();
  app.use(express.json());
  app.use(router);

  it("rejects unauthenticated requests", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" });
  });

  it("routes authenticated GET / to listWines", async () => {
    const response = await request(app)
      .get("/")
      .set("Authorization", "Bearer admin-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: "wine-1" }]);
    expect(listWines).toHaveBeenCalledTimes(1);
  });

  it("routes authenticated POST / to createWine", async () => {
    const response = await request(app)
      .post("/")
      .set("Authorization", "Bearer admin-token")
      .send({ name: "New wine" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: "wine-2" });
    expect(createWine).toHaveBeenCalledTimes(1);
  });

  it("routes authenticated PUT /:id to updateWine", async () => {
    const response = await request(app)
      .put("/wine-3")
      .set("Authorization", "Bearer admin-token")
      .send({ name: "Updated" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "wine-3" });
    expect(updateWine).toHaveBeenCalledTimes(1);
  });

  it("routes authenticated DELETE /:id to deleteWine", async () => {
    const response = await request(app)
      .delete("/wine-4")
      .set("Authorization", "Bearer admin-token");

    expect(response.status).toBe(204);
    expect(deleteWine).toHaveBeenCalledTimes(1);
  });
});
