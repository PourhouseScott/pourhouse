
import { Request, Response } from 'express';
import { adminWineService } from './_adminWineControllerDeps';


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
    const wine = await adminWineService.createWine(req.body);
    res.status(201).json(wine);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create wine', details: err instanceof Error ? err.message : err });
  }
};

export const updateWine = async (req: Request, res: Response) => {
  // TODO: Implement update logic
  res.json({ message: 'Update wine - not implemented' });
};

export const deleteWine = async (req: Request, res: Response) => {
  // TODO: Implement delete logic
  res.json({ message: 'Delete wine - not implemented' });
};
