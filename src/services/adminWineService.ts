import type { IWineRepository } from '@/repositories/wine/IWineRepository';
import type { Prisma } from '@prisma/client';

export interface IAdminWineService {
  listWines(): Promise<any[]>;
  createWine(input: Prisma.WineUncheckedCreateInput): Promise<any>;
  updateWine(id: string, input: Partial<Prisma.WineUncheckedUpdateInput>): Promise<any>;
  deleteWine(id: string): Promise<void>;
}

export class AdminWineService implements IAdminWineService {
  constructor(private wineRepository: IWineRepository) { }

  async listWines() {
    return this.wineRepository.findMany({});
  }

  async createWine(input: Prisma.WineUncheckedCreateInput) {
    return this.wineRepository.create(input);
  }

  async updateWine(id: string, input: Partial<Prisma.WineUncheckedUpdateInput>) {
    // Implement update logic (to be filled in)
    throw new Error('Not implemented');
  }

  async deleteWine(id: string) {
    // Implement delete logic (to be filled in)
    throw new Error('Not implemented');
  }
}
