import { describe, it, expect, vi } from 'vitest';
import { AdminWineService } from './adminWineService';

const mockWineRepository = () => ({
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe('AdminWineService', () => {
  it('listWines calls repository.findMany', async () => {
    const repo = mockWineRepository();
    const service = new AdminWineService(repo as any);
    await service.listWines();
    expect(repo.findMany).toHaveBeenCalledWith({});
  });

  it('createWine calls repository.create', async () => {
    const repo = mockWineRepository();
    const service = new AdminWineService(repo as any);
    const input = { name: 'Test' };
    await service.createWine(input as any);
    expect(repo.create).toHaveBeenCalledWith(input);
  });

  it('updateWine calls repository.update', async () => {
    const repo = mockWineRepository();
    const service = new AdminWineService(repo as any);
    await service.updateWine('id', { name: 'Updated' });
    expect(repo.update).toHaveBeenCalledWith('id', { name: 'Updated' });
  });

  it('updateWine throws if update not implemented', async () => {
    const repo = mockWineRepository();
    delete repo.update;
    const service = new AdminWineService(repo as any);
    await expect(service.updateWine('id', {})).rejects.toThrow('Update not implemented in repository');
  });

  it('deleteWine calls repository.delete', async () => {
    const repo = mockWineRepository();
    const service = new AdminWineService(repo as any);
    await service.deleteWine('id');
    expect(repo.delete).toHaveBeenCalledWith('id');
  });

  it('deleteWine throws if delete not implemented', async () => {
    const repo = mockWineRepository();
    delete repo.delete;
    const service = new AdminWineService(repo as any);
    await expect(service.deleteWine('id')).rejects.toThrow('Delete not implemented in repository');
  });
});
