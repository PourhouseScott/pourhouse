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
  let service: any;
  beforeEach(() => {
    vi.clearAllMocks();
    service = adminWineService as any;
  });

  it('should list wines', async () => {
    const req = {} as Request;
    const res = mockRes();
    const wines = [{ id: '1', name: 'Test Wine' }];
    service.listWines.mockResolvedValue(wines);
    await adminWineController.listWines(req, res);
    expect(res.json).toHaveBeenCalledWith(wines);
  });

  it('should handle error in listWines', async () => {
    const req = {} as Request;
    const res = mockRes();
    service.listWines.mockRejectedValue(new Error('fail'));
    await adminWineController.listWines(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to list wines' }));
  });

  it('should handle non-Error object in listWines error branch', async () => {
    const req = {} as Request;
    const res = mockRes();
    service.listWines.mockRejectedValue('fail-string');
    await adminWineController.listWines(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to list wines', details: 'fail-string' }));
  });

  it('should create wine with valid input', async () => {
    const input = {
      name: 'Wine',
      slug: 'wine',
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
    service.createWine.mockResolvedValue(wine);
    await adminWineController.createWine(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(wine);
  });

  it('should preserve provided slug and default squareItemId to null', async () => {
    const req = { body: { name: 'Ignored by mocked parse' } } as unknown as Request;
    const res = mockRes();
    const parsedWithSlug = {
      name: 'Wine Name',
      slug: 'provided-slug',
      vintage: 2020,
      wineryId: '550e8400-e29b-41d4-a716-446655440000',
      regionId: '123e4567-e89b-12d3-a456-426614174000',
      country: 'US',
      grapeVarieties: ['Cabernet'],
      alcoholPercent: 13.5,
      description: 'desc',
      imageUrl: 'http://img.com'
    };
    const parseSpy = vi.spyOn(createWineSchema, 'parse').mockReturnValue(parsedWithSlug as any);
    const wine = { id: '1', name: 'Wine Name' };
    service.createWine.mockResolvedValue(wine);

    await adminWineController.createWine(req, res);

    expect(service.createWine).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'provided-slug',
      squareItemId: null
    }));
    parseSpy.mockRestore();
  });

  it('should handle non-Zod error in createWine', async () => {
    const req = { body: { name: 'Wine' } } as unknown as Request;
    const res = mockRes();
    service.createWine.mockRejectedValue(new Error('fail'));
    // valid input, but service throws
    const validInput = {
      name: 'Wine',
      slug: 'wine',
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

  it('should handle non-Error object in createWine else branch', async () => {
    const req = {
      body: {
        name: 'Wine',
        slug: 'wine',
        vintage: 2020,
        wineryId: '550e8400-e29b-41d4-a716-446655440000',
        regionId: '123e4567-e89b-12d3-a456-426614174000',
        country: 'US',
        grapeVarieties: ['Cabernet'],
        alcoholPercent: 13.5,
        description: 'desc',
        imageUrl: 'http://img.com',
        squareItemId: 'sqid'
      }
    } as unknown as Request;
    const res = mockRes();
    service.createWine.mockRejectedValue('fail-string');
    await adminWineController.createWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to create wine', details: 'fail-string' }));
  });

  it('should return 422 for invalid create input', async () => {
    const req = { body: { name: '' } } as unknown as Request;
    const res = mockRes();
    await adminWineController.createWine(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation failed' }));
  });

  it('should update wine with valid input', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated', slug: 'updated' } } as unknown as Request;
    const res = mockRes();
    const wine = { id: '1', name: 'Updated' };
    service.updateWine.mockResolvedValue(wine);
    await adminWineController.updateWine(req, res);
    expect(res.json).toHaveBeenCalledWith(wine);
  });

  it('should handle non-Zod error in updateWine', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated', slug: 'updated' } } as unknown as Request;
    const res = mockRes();
    service.updateWine.mockRejectedValue(new Error('fail'));
    await adminWineController.updateWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to update wine' }));
  });

  it('should handle non-Error object in updateWine else branch', async () => {
    const req = { params: { id: '1' }, body: { name: 'Updated', slug: 'updated' } } as unknown as Request;
    const res = mockRes();
    service.updateWine.mockRejectedValue(12345);
    await adminWineController.updateWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to update wine', details: 12345 }));
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
    service.deleteWine.mockResolvedValue(undefined);
    await adminWineController.deleteWine(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle error in deleteWine', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockRes();
    service.deleteWine.mockRejectedValue(new Error('fail'));
    await adminWineController.deleteWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to delete wine' }));
  });

  it('should handle non-Error object in deleteWine else branch', async () => {
    const req = { params: { id: '1' } } as unknown as Request;
    const res = mockRes();
    service.deleteWine.mockRejectedValue({ foo: 'bar' });
    await adminWineController.deleteWine(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to delete wine', details: { foo: 'bar' } }));
  });
});
