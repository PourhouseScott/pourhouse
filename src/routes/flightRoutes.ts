import { Router } from "express";
import { flightController } from "@/container";
import { validateRequest } from "@/middleware/validateRequest";
import { addWineToFlightSchema, createFlightSchema, updateFlightSchema } from "@/models/validation";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(flightController.listFlights));
router.get("/:id", asyncHandler(flightController.getFlight));
router.post("/", validateRequest(createFlightSchema), asyncHandler(flightController.addFlight));
router.patch("/:id", validateRequest(updateFlightSchema), asyncHandler(flightController.patchFlight));
router.delete("/:id", asyncHandler(flightController.deleteFlight));
router.get("/:id/wines", asyncHandler(flightController.listFlightWines));
router.post(
  "/:id/wines",
  validateRequest(addWineToFlightSchema),
  asyncHandler(flightController.addWineToFlight)
);
router.delete("/:id/wines/:wineId", asyncHandler(flightController.removeWineFromFlight));

export default router;
