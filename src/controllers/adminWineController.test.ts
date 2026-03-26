import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as adminWineController from './adminWineController';
import { adminWineService } from '@/controllers/_adminWineControllerDeps';
import { createWineSchema } from '../models/validation';
import { Request, Response } from 'express';


// Mock the adminWineService dependency using absolute path alias
vi.mock('@/controllers/_adminWineControllerDeps', () => ({
  adminWineService: {
    listWines: vi.fn(),
    createWine: vi.fn(),
    updateWine: vi.fn(),
    deleteWine: vi.fn(),
  }
}));

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  res.send = vi.fn().mockReturnThis();
  return res as Response;
};

describe('adminWineController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list wines', async () => {
    const req = {} as Request;
    const res = mockRes();
    const wines = [{ id: '1', name: 'Test Wine' }];
    adminWineService.listWines.mockResolvedValue(wines);
    await adminWineController.listWines(req, res);
    expect(res.json).toHaveBeenCalledWith(wines);
  });

  it('should handle error in listWines', async () => {
    const req = {} as Request;
    const res = mockRes();
    adminWineService.listWines.mockRejectedValue(new Error('fail'));
    await adminWineController.listWines(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to list wines' }));
  });

  it('should create wine with valid input', async () => {
    const input = {
      name: 'Wine',
      vintage: 2020,
      wineryId: '550e8400-e29b-41d4-a716-446655440000',
      regionId: '123e4567-e89b-12d3-a456-426614174000',
      country: 'US',
      grapeVarieties: ['Cabernet'],
      alcoholPercent: 13.5,
      description: 'desc',
      imageUrl: 'http://img.com',
      squareItemId: 'sqid'
    };
    // Zod validation debug
    try {
      createWineSchema.parse(input);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Zod validation error in test:', err);
    }
    const req = { body: input } as unknown as Request;
    const res = mockRes();
    const wine = { id: '1', name: 'Wine' };
    adminWineService.createWine.mockResolvedValue(wine);
    await adminWineController.createWine(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(wine);
  });

  it('should handle non-Zod error in createWine', async () => {
    const req = { body: { name: 'Wine' } } as unknown as Request;
    const res = mockRes();
    adminWineService.createWine.mockRejectedValue(new Error('fail'));
    // valid input, but service throws
    const validInput = {
      name: 'Wine',
      vintage: 2020,
      wineryId: '550e8400-e29b-41d4-a716-446655440000',
      regionId: '123e4567-e89b-12d3-a456-426614174000',
      country: 'US',
      grapeVarieties: ['Cabernet'],
      alcoholPercent: 13.5,
      description: 'desc',
      imageUrl: 'http://img.com',
      squareItemId: 'sqid'
    };
    req.body = validInput;
    await adminWineController.createWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to create wine' }));
  });

  it('should return 422 for invalid create input', async () => {
    const req = { body: { name: '' } } as unknown as Request;
    const res = mockRes();
    await adminWineController.createWine(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed' }));
  });

  it('should update wine with valid input', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated' } } as unknown as Request;
    const res = mockRes();
    const wine = { id: '1', name: 'Updated' };
    adminWineService.updateWine.mockResolvedValue(wine);
    await adminWineController.updateWine(req, res);
    expect(res.json).toHaveBeenCalledWith(wine);
  });

  it('should handle non-Zod error in updateWine', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated' } } as unknown as Request;
    const res = mockRes();
    adminWineService.updateWine.mockRejectedValue(new Error('fail'));
    await adminWineController.updateWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to update wine' }));
  });

  it('should return 422 for invalid update input', async () => {
    const req = { params: { id: '1' }, body: { vintage: 1800 } } as unknown as Request;
    const res = mockRes();
    await adminWineController.updateWine(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed' }));
  });

  it('should delete wine', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockRes();
    adminWineService.deleteWine.mockResolvedValue(undefined);
    await adminWineController.deleteWine(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle error in deleteWine', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockRes();
    adminWineService.deleteWine.mockRejectedValue(new Error('fail'));
    await adminWineController.deleteWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to delete wine' }));
  });
});
