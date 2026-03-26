
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
    const wine = await adminWineService.createWine(parsed);
    res.status(201).json(wine);
  } catch (err) {
    if (err instanceof z.ZodError) {
      // eslint-disable-next-line no-console
      console.error('Zod validation error:', err.errors);
      res.status(422).json({ error: 'Validation failed', details: err.errors });
    } else {
      res.status(400).json({ error: 'Failed to create wine', details: err instanceof Error ? err.message : err });
    }
  }
};



export const updateWine = async (req: Request, res: Response) => {
  try {
    // Allow partial updates: use .partial() on the schema
    const parsed = createWineSchema.partial().parse(req.body);
    const wine = await adminWineService.updateWine(req.params.id, parsed);
    res.json(wine);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(422).json({ error: 'Validation failed', details: err.errors });
    } else {
      res.status(400).json({ error: 'Failed to update wine', details: err instanceof Error ? err.message : err });
    }
  }
};


export const deleteWine = async (req: Request, res: Response) => {
  try {
    await adminWineService.deleteWine(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete wine', details: err instanceof Error ? err.message : err });
  }
};
