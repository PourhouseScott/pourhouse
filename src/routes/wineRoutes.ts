import { Router } from "express";
import { wineController } from "@/container";
import { validateRequest } from "@/middleware/validateRequest";
import { createWineSchema, searchWineSchema } from "@/models/validation";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(wineController.listWines));
router.get("/search", validateRequest(searchWineSchema, "query"), asyncHandler(wineController.searchWine));
router.get("/:id", asyncHandler(wineController.getWine));
router.post("/", validateRequest(createWineSchema), asyncHandler(wineController.addWine));
router.get("/:id/ratings", asyncHandler(wineController.listWineRatings));

export default router;
