import path from "node:path";
import { Router } from "express";

const router = Router();
const wineDetailPage = path.resolve(process.cwd(), "public", "wine-detail.html");
const wineListEmbedPage = path.resolve(process.cwd(), "public", "wine-list-embed.html");

router.get("/wines/:slug", (_req, res) => {
  res.sendFile(wineDetailPage);
});

router.get("/embed/wine-list", (_req, res) => {
  res.sendFile(wineListEmbedPage);
});

export default router;
