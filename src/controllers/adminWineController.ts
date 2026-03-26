
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
  try {
    const wine = await adminWineService.updateWine(req.params.id, req.body);
    res.json(wine);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update wine', details: err instanceof Error ? err.message : err });
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
