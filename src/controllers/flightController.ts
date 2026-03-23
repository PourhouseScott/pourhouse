import type { Request, Response } from "express";
import { listFlightsQuerySchema } from "@/models/validation";
import { FlightService } from "@/services/flightService";

export class FlightController {
  public constructor(private readonly flightService: FlightService) { }

  public listFlights = async (req: Request, res: Response) => {
    const query = listFlightsQuerySchema.parse(req.query);
    const flights = await this.flightService.getFlights(query.activeOnly);
    res.status(200).json(flights);
  };

  public getFlight = async (req: Request, res: Response) => {
    const flightId = req.params.id as string;
    const flight = await this.flightService.getFlightById(flightId);
    res.status(200).json(flight);
  };

  public addFlight = async (req: Request, res: Response) => {
    const flight = await this.flightService.createFlight(req.body);
    res.status(201).json(flight);
  };

  public patchFlight = async (req: Request, res: Response) => {
    const flightId = req.params.id as string;
    const flight = await this.flightService.updateFlight(flightId, req.body);
    res.status(200).json(flight);
  };

  public deleteFlight = async (req: Request, res: Response) => {
    const flightId = req.params.id as string;
    await this.flightService.deleteFlight(flightId);
    res.status(204).send();
  };

  public listFlightWines = async (req: Request, res: Response) => {
    const flightId = req.params.id as string;
    const wines = await this.flightService.getFlightWines(flightId);
    res.status(200).json(wines);
  };

  public addWineToFlight = async (req: Request, res: Response) => {
    const flightId = req.params.id as string;
    const membership = await this.flightService.addWineToFlight(flightId, req.body);
    res.status(201).json(membership);
  };

  public removeWineFromFlight = async (req: Request, res: Response) => {
    const flightId = req.params.id as string;
    const wineId = req.params.wineId as string;
    await this.flightService.removeWineFromFlight(flightId, wineId);
    res.status(204).send();
  };
}
