import type { Prisma, PrismaClient } from "@prisma/client";
import type { IFlightRepository } from "@/repositories/flight/IFlightRepository";

export class FlightRepository implements IFlightRepository {
  public constructor(private readonly prisma: PrismaClient) { }

  public async findMany(activeOnly?: boolean) {
    return this.prisma.flight.findMany({
      ...(activeOnly === true ? { where: { isActive: true } } : {}),
      orderBy: { createdAt: "desc" }
    });
  }

  public async findById(id: string) {
    return this.prisma.flight.findUnique({
      where: { id }
    });
  }

  public async create(input: Prisma.FlightCreateInput) {
    return this.prisma.flight.create({
      data: input
    });
  }

  public async update(id: string, input: Prisma.FlightUpdateInput) {
    return this.prisma.flight.update({
      where: { id },
      data: input
    });
  }

  public async delete(id: string) {
    await this.prisma.flight.delete({
      where: { id }
    });
  }

  public async addWineToFlight(flightId: string, wineId: string, position: number) {
    return this.prisma.flightWine.create({
      data: {
        flight: { connect: { id: flightId } },
        wine: { connect: { id: wineId } },
        position
      }
    });
  }

  public async removeWineFromFlight(flightId: string, wineId: string) {
    const deleted = await this.prisma.flightWine.deleteMany({
      where: {
        flightId,
        wineId
      }
    });

    return deleted.count;
  }

  public async findWinesByFlight(flightId: string) {
    const rows = await this.prisma.flightWine.findMany({
      where: { flightId },
      include: {
        wine: true
      },
      orderBy: {
        position: "asc"
      }
    });

    return rows.map((row) => row.wine);
  }

  public async isWineInActiveFlight(wineId: string) {
    const membershipCount = await this.prisma.flightWine.count({
      where: {
        wineId,
        flight: {
          isActive: true
        }
      }
    });

    return membershipCount > 0;
  }
}
