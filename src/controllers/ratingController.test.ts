import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { RatingController } from "@/controllers/ratingController";
import type { RatingService } from "@/services/ratingService";
import { AppError } from "@/utils/appError";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn()
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);

  return res;
}

describe("RatingController", () => {
  it("throws unauthorized when req.user is missing", async () => {
    const ratingService = {
      createRating: vi.fn()
    } as unknown as RatingService;

    const controller = new RatingController(ratingService);
    const req = { body: { wineId: "w1", rating: 4, notes: "Great" } } as unknown as Request;

    await expect(controller.addRating(req, createResponse())).rejects.toEqual(
      new AppError("Unauthorized", 401)
    );
    expect(ratingService.createRating).not.toHaveBeenCalled();
  });

  it("adds rating and returns 201", async () => {
    const ratingService = {
      createRating: vi.fn()
    } as unknown as RatingService;

    vi.mocked(ratingService.createRating).mockResolvedValue({ id: "r1" });

    const controller = new RatingController(ratingService);
    const req = {
      user: { id: "user-1", email: "u@example.com", role: "USER" },
      body: { wineId: "w1", rating: 4, notes: "Great" }
    } as unknown as Request;
    const res = createResponse();

    await controller.addRating(req, res);

    expect(ratingService.createRating).toHaveBeenCalledWith({
      userId: "user-1",
      wineId: "w1",
      rating: 4,
      notes: "Great"
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "r1" });
  });
});
