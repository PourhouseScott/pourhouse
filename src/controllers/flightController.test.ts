import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { FlightController } from "@/controllers/flightController";
import type { FlightService } from "@/services/flightService";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn()
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);
  vi.mocked(res.send).mockReturnValue(res);

  return res;
}

describe("FlightController", () => {
  it("listFlights returns 200", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.getFlights).mockResolvedValue([{ id: "f1" }] as never);

    const controller = new FlightController(flightService);
    const req = { query: { activeOnly: "true" } } as unknown as Request;
    const res = createResponse();

    await controller.listFlights(req, res);

    expect(flightService.getFlights).toHaveBeenCalledWith(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: "f1" }]);
  });

  it("getFlight returns 200", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.getFlightById).mockResolvedValue({ id: "f1" } as never);

    const controller = new FlightController(flightService);
    const req = { params: { id: "f1" } } as unknown as Request;
    const res = createResponse();

    await controller.getFlight(req, res);

    expect(flightService.getFlightById).toHaveBeenCalledWith("f1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("addFlight returns 201", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.createFlight).mockResolvedValue({ id: "f1" } as never);

    const controller = new FlightController(flightService);
    const req = { body: { name: "Weekend" } } as Request;
    const res = createResponse();

    await controller.addFlight(req, res);

    expect(flightService.createFlight).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("patchFlight returns 200", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.updateFlight).mockResolvedValue({ id: "f1", isActive: false } as never);

    const controller = new FlightController(flightService);
    const req = { params: { id: "f1" }, body: { isActive: false } } as unknown as Request;
    const res = createResponse();

    await controller.patchFlight(req, res);

    expect(flightService.updateFlight).toHaveBeenCalledWith("f1", { isActive: false });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deleteFlight returns 204", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.deleteFlight).mockResolvedValue(undefined);

    const controller = new FlightController(flightService);
    const req = { params: { id: "f1" } } as unknown as Request;
    const res = createResponse();

    await controller.deleteFlight(req, res);

    expect(flightService.deleteFlight).toHaveBeenCalledWith("f1");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("listFlightWines returns 200", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.getFlightWines).mockResolvedValue([{ id: "w1" }] as never);

    const controller = new FlightController(flightService);
    const req = { params: { id: "f1" } } as unknown as Request;
    const res = createResponse();

    await controller.listFlightWines(req, res);

    expect(flightService.getFlightWines).toHaveBeenCalledWith("f1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("addWineToFlight returns 201", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.addWineToFlight).mockResolvedValue({ id: "row-1" } as never);

    const controller = new FlightController(flightService);
    const req = { params: { id: "f1" }, body: { wineId: "w1" } } as unknown as Request;
    const res = createResponse();

    await controller.addWineToFlight(req, res);

    expect(flightService.addWineToFlight).toHaveBeenCalledWith("f1", { wineId: "w1" });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("removeWineFromFlight returns 204", async () => {
    const flightService = {
      getFlights: vi.fn(),
      getFlightById: vi.fn(),
      createFlight: vi.fn(),
      updateFlight: vi.fn(),
      deleteFlight: vi.fn(),
      getFlightWines: vi.fn(),
      addWineToFlight: vi.fn(),
      removeWineFromFlight: vi.fn(),
      isWineFeaturedInFlight: vi.fn()
    } as unknown as FlightService;

    vi.mocked(flightService.removeWineFromFlight).mockResolvedValue(undefined);

    const controller = new FlightController(flightService);
    const req = { params: { id: "f1", wineId: "w1" } } as unknown as Request;
    const res = createResponse();

    await controller.removeWineFromFlight(req, res);

    expect(flightService.removeWineFromFlight).toHaveBeenCalledWith("f1", "w1");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
