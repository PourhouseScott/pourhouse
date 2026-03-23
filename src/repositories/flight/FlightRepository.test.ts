import { describe, expect, it, vi } from "vitest";
import { FlightRepository } from "@/repositories/flight/FlightRepository";

describe("FlightRepository", () => {
  it("findMany filters by active state when activeOnly is true", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      flight: {
        findMany
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await repository.findMany(true);

    expect(findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
  });

  it("findMany returns all flights when activeOnly is undefined", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      flight: {
        findMany
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await repository.findMany();

    expect(findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { createdAt: "desc" }
    });
  });

  it("findById reads flight by id", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const prisma = {
      flight: {
        findUnique
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await repository.findById("flight-1");

    expect(findUnique).toHaveBeenCalledWith({ where: { id: "flight-1" } });
  });

  it("create writes a flight record", async () => {
    const create = vi.fn().mockResolvedValue(null);
    const prisma = {
      flight: {
        create
      }
    } as never;

    const repository = new FlightRepository(prisma);
    const input = { name: "Tasting Flight", isActive: true };

    await repository.create(input);

    expect(create).toHaveBeenCalledWith({ data: input });
  });

  it("update writes partial fields", async () => {
    const update = vi.fn().mockResolvedValue(null);
    const prisma = {
      flight: {
        update
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await repository.update("flight-1", { isActive: false });

    expect(update).toHaveBeenCalledWith({
      where: { id: "flight-1" },
      data: { isActive: false }
    });
  });

  it("delete removes a flight by id", async () => {
    const del = vi.fn().mockResolvedValue(null);
    const prisma = {
      flight: {
        delete: del
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await repository.delete("flight-1");

    expect(del).toHaveBeenCalledWith({
      where: { id: "flight-1" }
    });
  });

  it("addWineToFlight creates membership row", async () => {
    const create = vi.fn().mockResolvedValue(null);
    const prisma = {
      flightWine: {
        create
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await repository.addWineToFlight("flight-1", "wine-1", 2);

    expect(create).toHaveBeenCalledWith({
      data: {
        flight: { connect: { id: "flight-1" } },
        wine: { connect: { id: "wine-1" } },
        position: 2
      }
    });
  });

  it("removeWineFromFlight deletes membership and returns count", async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      flightWine: {
        deleteMany
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await expect(repository.removeWineFromFlight("flight-1", "wine-1")).resolves.toBe(1);
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        flightId: "flight-1",
        wineId: "wine-1"
      }
    });
  });

  it("findWinesByFlight returns ordered wine records", async () => {
    const findMany = vi.fn().mockResolvedValue([
      { wine: { id: "wine-1", name: "A" } },
      { wine: { id: "wine-2", name: "B" } }
    ]);
    const prisma = {
      flightWine: {
        findMany
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await expect(repository.findWinesByFlight("flight-1")).resolves.toEqual([
      { id: "wine-1", name: "A" },
      { id: "wine-2", name: "B" }
    ]);
    expect(findMany).toHaveBeenCalledWith({
      where: { flightId: "flight-1" },
      include: {
        wine: true
      },
      orderBy: {
        position: "asc"
      }
    });
  });

  it("isWineInActiveFlight returns true when count is positive", async () => {
    const count = vi.fn().mockResolvedValue(2);
    const prisma = {
      flightWine: {
        count
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await expect(repository.isWineInActiveFlight("wine-1")).resolves.toBe(true);
    expect(count).toHaveBeenCalledWith({
      where: {
        wineId: "wine-1",
        flight: {
          isActive: true
        }
      }
    });
  });

  it("isWineInActiveFlight returns false when count is zero", async () => {
    const count = vi.fn().mockResolvedValue(0);
    const prisma = {
      flightWine: {
        count
      }
    } as never;

    const repository = new FlightRepository(prisma);

    await expect(repository.isWineInActiveFlight("wine-1")).resolves.toBe(false);
  });
});
