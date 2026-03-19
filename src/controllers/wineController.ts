import type { Request, Response } from "express";
import type { ListWinesQuery } from "@/services/wineService";
import { WineService } from "@/services/wineService";

export class WineController {
  public constructor(private readonly wineService: WineService) { }

  public listWines = async (req: Request, res: Response) => {
    const wines = await this.wineService.getWines(req.query as unknown as ListWinesQuery);
    res.status(200).json(wines);
  };

  public getWine = async (req: Request, res: Response) => {
    const wineSlug = req.params.slug as string;
    const wine = await this.wineService.getWineBySlug(wineSlug);
    res.status(200).json(wine);
  };

  public addWine = async (req: Request, res: Response) => {
    const wine = await this.wineService.createWine(req.body);
    res.status(201).json(wine);
  };

  public searchWine = async (req: Request, res: Response) => {
    const wines = await this.wineService.searchWines(req.query.q as string);
    res.status(200).json(wines);
  };

  public listWineRatings = async (req: Request, res: Response) => {
    const wineId = req.params.id as string;
    const ratings = await this.wineService.getWineRatings(wineId);
    res.status(200).json(ratings);
  };
}
