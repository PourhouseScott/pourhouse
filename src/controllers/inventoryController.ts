import type { Request, Response } from "express";
import { InventoryService } from "@/services/inventoryService";

export class InventoryController {
  public constructor(private readonly inventoryService: InventoryService) { }

  public listInventory = async (_req: Request, res: Response) => {
    const inventory = await this.inventoryService.getInventory();
    res.status(200).json(inventory);
  };

  public getInventoryItem = async (req: Request, res: Response) => {
    const inventoryId = req.params.id as string;
    const item = await this.inventoryService.getInventoryById(inventoryId);
    res.status(200).json(item);
  };

  public addInventory = async (req: Request, res: Response) => {
    const item = await this.inventoryService.createInventory(req.body);
    res.status(201).json(item);
  };

  public patchInventory = async (req: Request, res: Response) => {
    const inventoryId = req.params.id as string;
    const item = await this.inventoryService.updateInventory(inventoryId, req.body);
    res.status(200).json(item);
  };
}
