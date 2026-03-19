import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "@/app";

describe("wineRoutes", () => {
  it("returns 400 for invalid wine list query params", async () => {
    const response = await request(app).get("/api/wines?page=0&sort=invalid");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["page"]
        }),
        expect.objectContaining({
          path: ["sort"]
        })
      ])
    );
  });
});
