import type { Request, Response } from "express";
import { RatingService } from "@/services/ratingService";
import { AppError } from "@/utils/appError";

export class RatingController {
  public constructor(private readonly ratingService: RatingService) { }

  public addRating = async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const rating = await this.ratingService.createRating({
      userId: req.user.id,
      wineId: req.body.wineId,
      rating: req.body.rating,
      notes: req.body.notes
    });

    res.status(201).json(rating);
  };
}
