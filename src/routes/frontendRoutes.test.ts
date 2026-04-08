import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import frontendRoutes from "@/routes/frontendRoutes";

describe("frontendRoutes", () => {
  const app = express();
  app.use(frontendRoutes);

  it("serves admin wines frontend with core editor controls", async () => {
    const response = await request(app).get("/admin/wines");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("id=\"admin-wines-root\"");
    expect(response.text).toContain("id=\"google-signin\"");
    expect(response.text).toContain("id=\"wine-form\"");
    expect(response.text).toContain("id=\"wine-list\"");
  });

  it("serves wine detail frontend shell", async () => {
    const response = await request(app).get("/wines/test-wine");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("id=\"wine-detail-root\"");
  });

  it("serves embeddable wine list frontend shell", async () => {
    const response = await request(app).get("/embed/wine-list");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("id=\"wine-list-embed-root\"");
  });
});
