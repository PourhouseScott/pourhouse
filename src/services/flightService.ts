import type { IFlightRepository } from "@/repositories/flight/IFlightRepository";
import type { IWineRepository } from "@/repositories/wine/IWineRepository";
import { AppError } from "@/utils/appError";

export type CreateFlightInput = {
  name: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateFlightInput = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export type AddWineToFlightInput = {
  wineId: string;
  position?: number;
};

export class FlightService {
  public constructor(
    private readonly flightRepository: IFlightRepository,
    private readonly wineRepository: IWineRepository
  ) { }

  public async getFlights(activeOnly?: boolean) {
    return this.flightRepository.findMany(activeOnly);
  }

  public async getFlightById(id: string) {
    const flight = await this.flightRepository.findById(id);

    if (!flight) {
      throw new AppError("Flight not found", 404);
    }

    return flight;
  }

  public async createFlight(input: CreateFlightInput) {
    return this.flightRepository.create({
      name: input.name,
      description: input.description ?? null,
      isActive: input.isActive ?? true
    });
  }

  public async updateFlight(id: string, input: UpdateFlightInput) {
    await this.getFlightById(id);

    return this.flightRepository.update(id, input);
  }

  public async deleteFlight(id: string) {
    await this.getFlightById(id);
    await this.flightRepository.delete(id);
  }

  public async addWineToFlight(flightId: string, input: AddWineToFlightInput) {
    await this.getFlightById(flightId);

    const wine = await this.wineRepository.findByIdWithInventory(input.wineId);

    if (!wine) {
      throw new AppError("Wine not found", 404);
    }

    return this.flightRepository.addWineToFlight(flightId, input.wineId, input.position ?? 0);
  }

  public async removeWineFromFlight(flightId: string, wineId: string) {
    await this.getFlightById(flightId);

    const deletedCount = await this.flightRepository.removeWineFromFlight(flightId, wineId);

    if (deletedCount === 0) {
      throw new AppError("Flight membership not found", 404);
    }
  }

  public async getFlightWines(flightId: string) {
    await this.getFlightById(flightId);
    return this.flightRepository.findWinesByFlight(flightId);
  }

  public async isWineFeaturedInFlight(wineId: string) {
    return this.flightRepository.isWineInActiveFlight(wineId);
  }
}
