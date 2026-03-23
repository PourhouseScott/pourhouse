import { Router } from "express";
import authRoutes from "./authRoutes";
import flightRoutes from "./flightRoutes";
import inventoryRoutes from "./inventoryRoutes";
import ratingRoutes from "./ratingRoutes";
import wineRoutes from "./wineRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/wines", wineRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/ratings", ratingRoutes);
router.use("/flights", flightRoutes);

export default router;
