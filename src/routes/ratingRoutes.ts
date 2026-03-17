import { Router } from "express";
import { ratingController } from "@/container";
import { authMiddleware } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { createRatingSchema } from "@/models/validation";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createRatingSchema),
  asyncHandler(ratingController.addRating)
);

export default router;
