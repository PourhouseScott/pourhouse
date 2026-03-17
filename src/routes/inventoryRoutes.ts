import { Router } from "express";
import { inventoryController } from "@/container";
import { validateRequest } from "@/middleware/validateRequest";
import { createInventorySchema, updateInventorySchema } from "@/models/validation";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(inventoryController.listInventory));
router.get("/:id", asyncHandler(inventoryController.getInventoryItem));
router.post("/", validateRequest(createInventorySchema), asyncHandler(inventoryController.addInventory));
router.patch("/:id", validateRequest(updateInventorySchema), asyncHandler(inventoryController.patchInventory));

export default router;
