import type { Flight, FlightWine, Prisma, Wine } from "@prisma/client";

export type FlightWithWines = Flight & {
  wines: (FlightWine & { wine: Wine })[];
};

export interface IFlightRepository {
  findMany(activeOnly?: boolean): Promise<Flight[]>;
  findById(id: string): Promise<Flight | null>;
  create(input: Prisma.FlightCreateInput): Promise<Flight>;
  update(id: string, input: Prisma.FlightUpdateInput): Promise<Flight>;
  delete(id: string): Promise<void>;
  addWineToFlight(flightId: string, wineId: string, position: number): Promise<FlightWine>;
  removeWineFromFlight(flightId: string, wineId: string): Promise<number>;
  findWinesByFlight(flightId: string): Promise<Wine[]>;
  isWineInActiveFlight(wineId: string): Promise<boolean>;
}
