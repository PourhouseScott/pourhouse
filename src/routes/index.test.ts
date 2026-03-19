import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "@/app";

describe("routes index", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("serves the wine detail frontend shell by slug route", async () => {
    const response = await request(app).get("/wines/cabernet-2020");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("id=\"wine-detail-root\"");
    expect(response.text).toContain("/static/wine-detail.js");
  });

  it("serves static frontend assets", async () => {
    const response = await request(app).get("/static/wine-detail.js");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("javascript");
    expect(response.text).toContain("loadWineBySlug");
  });
});
