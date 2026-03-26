import { PrismaClient } from '@prisma/client';
import { WineRepository } from '@/repositories/wine/WineRepository';
import { AdminWineService } from '@/services/adminWineService';

const prisma = new PrismaClient();
const wineRepository = new WineRepository(prisma);
export const adminWineService = new AdminWineService(wineRepository);
