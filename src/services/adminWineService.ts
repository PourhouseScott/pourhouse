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
    // Guard against repos that don't implement write operations.
    if (typeof (this.wineRepository as any).update !== 'function') {
      throw new Error('Update not implemented in repository');
    }
    return (this.wineRepository as any).update(id, input);
  }

  async deleteWine(id: string) {
    if (typeof (this.wineRepository as any).delete !== 'function') {
      throw new Error('Delete not implemented in repository');
    }
    return (this.wineRepository as any).delete(id);
  }
}
