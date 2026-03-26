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
    // Only allow updating fields that are present in input
    // (Assume WineRepository has a method for update, otherwise use prisma directly)
    // For now, use prisma directly for update
    // @ts-ignore
    if (!('update' in this.wineRepository)) {
      throw new Error('Update not implemented in repository');
    }
    // @ts-ignore
    return this.wineRepository.update(id, input);
  }

  async deleteWine(id: string) {
    // @ts-ignore
    if (!('delete' in this.wineRepository)) {
      throw new Error('Delete not implemented in repository');
    }
    // @ts-ignore
    return this.wineRepository.delete(id);
  }
}
