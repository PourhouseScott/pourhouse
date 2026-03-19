import path from "node:path";
import { Router } from "express";

const router = Router();
const wineDetailPage = path.resolve(process.cwd(), "public", "wine-detail.html");

router.get("/wines/:slug", (_req, res) => {
  res.sendFile(wineDetailPage);
});

export default router;
