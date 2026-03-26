
import { Request, Response } from 'express';

import { adminWineService } from './_adminWineControllerDeps';
import { createWineSchema } from '../models/validation';
import { z } from 'zod';


export const listWines = async (req: Request, res: Response) => {
  try {
    const wines = await adminWineService.listWines();
    res.json(wines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list wines', details: err instanceof Error ? err.message : err });
  }
};



export const createWine = async (req: Request, res: Response) => {
  try {
    const parsed = createWineSchema.parse(req.body);
    // Ensure slug is present (required by Prisma)
    const wineInput = {
      ...parsed,
      slug: parsed.slug ?? parsed.name.toLowerCase().replace(/\s+/g, '-')
    };
    const wine = await adminWineService.createWine(wineInput);
    res.status(201).json(wine);
  } catch (err) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line no-console
      console.error('Zod validation error:', err.issues);
      res.status(422).json({ error: 'Validation failed', details: err.issues });
    } else {
      res.status(400).json({ error: 'Failed to create wine', details: err instanceof Error ? err.message : err });
    }
  }
};



export const updateWine = async (req: Request, res: Response) => {
  try {
    // Allow partial updates: use .partial() on the schema
    const parsed = createWineSchema.partial().parse(req.body);
    // Remove undefined properties for Prisma update
    const updateInput = Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v !== undefined));
    const wine = await adminWineService.updateWine(String(req.params.id), updateInput);
    res.json(wine);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: 'Validation failed', details: err.issues });
    } else {
      res.status(400).json({ error: 'Failed to update wine', details: err instanceof Error ? err.message : err });
    }
  }
};


export const deleteWine = async (req: Request, res: Response) => {
  try {
    await adminWineService.deleteWine(String(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete wine', details: err instanceof Error ? err.message : err });
  }
};
