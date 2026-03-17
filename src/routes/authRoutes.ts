import { Router } from "express";
import { authController } from "@/container";
import { validateRequest } from "@/middleware/validateRequest";
import { loginSchema, registerSchema } from "@/models/validation";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

router.post("/register", validateRequest(registerSchema), asyncHandler(authController.register));
router.post("/login", validateRequest(loginSchema), asyncHandler(authController.login));

export default router;
