import type { IRatingRepository } from "@/repositories/rating/IRatingRepository";
import type { IWineRepository } from "@/repositories/wine/IWineRepository";
import { AppError } from "@/utils/appError";

export type CreateRatingInput = {
  userId: string;
  wineId: string;
  rating: number;
  notes: string;
};

export class RatingService {
  public constructor(
    private readonly ratingRepository: IRatingRepository,
    private readonly wineRepository: IWineRepository
  ) { }

  public async createRating(input: CreateRatingInput) {
    if (input.rating < 1 || input.rating > 5) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    const wine = await this.wineRepository.findByIdWithInventory(input.wineId);

    if (!wine) {
      throw new AppError("Wine not found", 404);
    }

    return this.ratingRepository.create({
      user: { connect: { id: input.userId } },
      wine: { connect: { id: input.wineId } },
      rating: input.rating,
      notes: input.notes
    });
  }
}
