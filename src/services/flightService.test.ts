import { describe, expect, it, vi } from "vitest";
import type { IFlightRepository } from "@/repositories/flight/IFlightRepository";
import type { IWineRepository } from "@/repositories/wine/IWineRepository";
import { FlightService } from "@/services/flightService";
import { AppError } from "@/utils/appError";

function createService() {
  const flightRepository: IFlightRepository = {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addWineToFlight: vi.fn(),
    removeWineFromFlight: vi.fn(),
    findWinesByFlight: vi.fn(),
    isWineInActiveFlight: vi.fn()
  };

  const wineRepository: IWineRepository = {
    findMany: vi.fn(),
    findByIdWithInventory: vi.fn(),
    findBySlugWithInventory: vi.fn(),
    create: vi.fn(),
    findByUniqueNameWineryVintage: vi.fn(),
    search: vi.fn(),
    findBySlug: vi.fn(),
    findBySquareItemId: vi.fn()
  };

  return {
    service: new FlightService(flightRepository, wineRepository),
    flightRepository,
    wineRepository
  };
}

describe("FlightService", () => {
  it("returns all flights", async () => {
    const { service, flightRepository } = createService();
    const flights = [{ id: "flight-1" }];

    vi.mocked(flightRepository.findMany).mockResolvedValue(flights as never);

    await expect(service.getFlights()).resolves.toEqual(flights);
  });

  it("returns active flights when requested", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.findMany).mockResolvedValue([] as never);

    await service.getFlights(true);

    expect(flightRepository.findMany).toHaveBeenCalledWith(true);
  });

  it("returns flight by id", async () => {
    const { service, flightRepository } = createService();
    const flight = { id: "flight-1" };

    vi.mocked(flightRepository.findById).mockResolvedValue(flight as never);

    await expect(service.getFlightById("flight-1")).resolves.toEqual(flight);
  });

  it("throws when flight is missing", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue(null);

    await expect(service.getFlightById("missing")).rejects.toEqual(new AppError("Flight not found", 404));
  });

  it("creates flight with default active flag", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.create).mockResolvedValue({ id: "flight-1" } as never);

    await service.createFlight({ name: "Sunday Flight" });

    expect(flightRepository.create).toHaveBeenCalledWith({
      name: "Sunday Flight",
      description: null,
      isActive: true
    });
  });

  it("updates flight after existence check", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue({ id: "flight-1" } as never);
    vi.mocked(flightRepository.update).mockResolvedValue({ id: "flight-1", isActive: false } as never);

    await service.updateFlight("flight-1", { isActive: false });

    expect(flightRepository.update).toHaveBeenCalledWith("flight-1", { isActive: false });
  });

  it("deletes flight after existence check", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue({ id: "flight-1" } as never);
    vi.mocked(flightRepository.delete).mockResolvedValue(undefined);

    await service.deleteFlight("flight-1");

    expect(flightRepository.delete).toHaveBeenCalledWith("flight-1");
  });

  it("adds wine to flight with default position", async () => {
    const { service, flightRepository, wineRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue({ id: "flight-1" } as never);
    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue({ id: "wine-1" } as never);
    vi.mocked(flightRepository.addWineToFlight).mockResolvedValue({ id: "row-1" } as never);

    await service.addWineToFlight("flight-1", { wineId: "wine-1" });

    expect(flightRepository.addWineToFlight).toHaveBeenCalledWith("flight-1", "wine-1", 0);
  });

  it("throws when adding missing wine", async () => {
    const { service, flightRepository, wineRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue({ id: "flight-1" } as never);
    vi.mocked(wineRepository.findByIdWithInventory).mockResolvedValue(null);

    await expect(service.addWineToFlight("flight-1", { wineId: "wine-missing" })).rejects.toEqual(
      new AppError("Wine not found", 404)
    );
  });

  it("removes wine from flight", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue({ id: "flight-1" } as never);
    vi.mocked(flightRepository.removeWineFromFlight).mockResolvedValue(1);

    await service.removeWineFromFlight("flight-1", "wine-1");

    expect(flightRepository.removeWineFromFlight).toHaveBeenCalledWith("flight-1", "wine-1");
  });

  it("throws when flight membership is missing", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue({ id: "flight-1" } as never);
    vi.mocked(flightRepository.removeWineFromFlight).mockResolvedValue(0);

    await expect(service.removeWineFromFlight("flight-1", "wine-1")).rejects.toEqual(
      new AppError("Flight membership not found", 404)
    );
  });

  it("returns wines for a flight", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.findById).mockResolvedValue({ id: "flight-1" } as never);
    vi.mocked(flightRepository.findWinesByFlight).mockResolvedValue([{ id: "wine-1" }] as never);

    await expect(service.getFlightWines("flight-1")).resolves.toEqual([{ id: "wine-1" }]);
  });

  it("checks featured-in-flight indicator", async () => {
    const { service, flightRepository } = createService();

    vi.mocked(flightRepository.isWineInActiveFlight).mockResolvedValue(true);

    await expect(service.isWineFeaturedInFlight("wine-1")).resolves.toBe(true);
  });
});
