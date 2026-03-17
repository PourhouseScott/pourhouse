import { prisma } from "@/config/prisma";
import { AuthController } from "@/controllers/authController";
import { InventoryController } from "@/controllers/inventoryController";
import { RatingController } from "@/controllers/ratingController";
import { WineController } from "@/controllers/wineController";
import { InventoryRepository } from "@/repositories/inventory/InventoryRepository";
import { RatingRepository } from "@/repositories/rating/RatingRepository";
import { RegionRepository } from "@/repositories/region/RegionRepository";
import { UserRepository } from "@/repositories/user/UserRepository";
import { WineRepository } from "@/repositories/wine/WineRepository";
import { WineryRepository } from "@/repositories/winery/WineryRepository";
import { AuthService } from "@/services/authService";
import { InventoryService } from "@/services/inventoryService";
import { RatingService } from "@/services/ratingService";
import { WineService } from "@/services/wineService";

const wineRepository = new WineRepository(prisma);
const wineryRepository = new WineryRepository(prisma);
const regionRepository = new RegionRepository(prisma);
const ratingRepository = new RatingRepository(prisma);
const inventoryRepository = new InventoryRepository(prisma);
const userRepository = new UserRepository(prisma);

const wineService = new WineService(
  wineRepository,
  wineryRepository,
  regionRepository,
  ratingRepository
);
const inventoryService = new InventoryService(inventoryRepository, wineRepository);
const ratingService = new RatingService(ratingRepository, wineRepository);
const authService = new AuthService(userRepository);

export const authController = new AuthController(authService);
export const wineController = new WineController(wineService);
export const inventoryController = new InventoryController(inventoryService);
export const ratingController = new RatingController(ratingService);
