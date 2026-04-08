import { Router } from "express";
import { authController } from "@/container";
import { validateRequest } from "@/middleware/validateRequest";
import { googleAuthSchema } from "@/models/validation";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.get("/google/start", asyncHandler(authController.startGoogleSignIn));
router.get("/google/callback", asyncHandler(authController.handleGoogleCallback));
router.post("/google", validateRequest(googleAuthSchema), asyncHandler(authController.authenticateWithGoogle));

export default router;
