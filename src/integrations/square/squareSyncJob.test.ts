import { describe, expect, it, vi } from "vitest";
import {
  createNodeCronScheduler,
  createSquareSyncJob,
  runSquareSyncOnce,
  type SquareSyncCronScheduler,
  type SquareSyncLogger,
  type SquareSyncTask
} from "@/integrations/square/squareSyncJob";

function createLoggerMock(): SquareSyncLogger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

type ManualTaskController = {
  startCalls: number;
  stopCalls: number;
  runScheduled: () => Promise<void>;
};

function createManualCronScheduler(): {
  scheduler: SquareSyncCronScheduler;
  controller: ManualTaskController;
} {
  let scheduledRun: (() => Promise<void>) | null = null;
  const task: SquareSyncTask = {
    start: vi.fn(),
    stop: vi.fn()
  };

  const scheduler: SquareSyncCronScheduler = {
    schedule: vi.fn().mockImplementation((_cronExpression: string, run: () => Promise<void>) => {
      scheduledRun = run;
      return task;
    })
  };

  return {
    scheduler,
    controller: {
      get startCalls() {
        return vi.mocked(task.start).mock.calls.length;
      },
      get stopCalls() {
        return vi.mocked(task.stop).mock.calls.length;
      },
      async runScheduled() {
        if (!scheduledRun) {
          throw new Error("No scheduled run callback captured.");
        }

        await scheduledRun();
      }
    }
  };
}

describe("runSquareSyncOnce", () => {
  it("fetches catalog objects, syncs them, and logs a summary", async () => {
    const logger = createLoggerMock();
    const catalogService = {
      fetchCatalogItems: vi.fn().mockResolvedValue([{ id: "item-1" }] as never[])
    };
    const syncService = {
      syncCatalogObjects: vi.fn().mockResolvedValue({
        created: 1,
        updated: 2,
        skipped: 3,
        inventoryRowsSynced: 4
      })
    };
    const now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1450);

    const result = await runSquareSyncOnce({
      catalogService,
      syncService,
      logger,
      now
    });

    expect(catalogService.fetchCatalogItems).toHaveBeenCalledTimes(1);
    expect(syncService.syncCatalogObjects).toHaveBeenCalledWith([{ id: "item-1" }]);
    expect(result).toEqual({
      created: 1,
      updated: 2,
      skipped: 3,
      inventoryRowsSynced: 4
    });

    expect(logger.info).toHaveBeenCalledWith("[square-sync] run started");
    expect(logger.info).toHaveBeenLastCalledWith(
      "[square-sync] run completed",
      JSON.stringify({
        catalogObjectsFetched: 1,
        created: 1,
        updated: 2,
        skipped: 3,
        inventoryRowsSynced: 4,
        durationMs: 450
      })
    );
  });

  it("uses default logger and clock when optional dependencies are not provided", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const catalogService = {
      fetchCatalogItems: vi.fn().mockResolvedValue([])
    };
    const syncService = {
      syncCatalogObjects: vi.fn().mockResolvedValue({
        created: 0,
        updated: 0,
        skipped: 0,
        inventoryRowsSynced: 0
      })
    };

    await runSquareSyncOnce({
      catalogService,
      syncService
    });

    expect(infoSpy).toHaveBeenCalled();
    infoSpy.mockRestore();
  });
});

describe("createSquareSyncJob", () => {
  it("returns a no-op handle when disabled", async () => {
    const logger = createLoggerMock();
    const cronScheduler = {
      schedule: vi.fn()
    } satisfies SquareSyncCronScheduler;

    const job = createSquareSyncJob(
      {
        enabled: false,
        cronExpression: "*/10 * * * *"
      },
      {
        logger,
        cronScheduler,
        catalogService: {
          fetchCatalogItems: vi.fn().mockResolvedValue([])
        },
        syncService: {
          syncCatalogObjects: vi.fn().mockResolvedValue({
            created: 0,
            updated: 0,
            skipped: 0,
            inventoryRowsSynced: 0
          })
        }
      }
    );

    await job.triggerNow();
    job.stop();

    expect(cronScheduler.schedule).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("[square-sync] scheduler disabled");
  });

  it("can use default logger and cron scheduler", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const job = createSquareSyncJob(
      {
        enabled: true,
        cronExpression: "* * * * *"
      },
      {
        catalogService: {
          fetchCatalogItems: vi.fn().mockResolvedValue([])
        },
        syncService: {
          syncCatalogObjects: vi.fn().mockResolvedValue({
            created: 0,
            updated: 0,
            skipped: 0,
            inventoryRowsSynced: 0
          })
        }
      }
    );

    job.stop();
    expect(infoSpy).toHaveBeenCalled();
    infoSpy.mockRestore();
  });

  it("starts the scheduled task, runs sync, and stops cleanly", async () => {
    const logger = createLoggerMock();
    const { scheduler, controller } = createManualCronScheduler();
    const catalogService = {
      fetchCatalogItems: vi.fn().mockResolvedValue([{ id: "item-2" }] as never[])
    };
    const syncService = {
      syncCatalogObjects: vi.fn().mockResolvedValue({
        created: 1,
        updated: 0,
        skipped: 0,
        inventoryRowsSynced: 1
      })
    };

    const job = createSquareSyncJob(
      {
        enabled: true,
        cronExpression: "*/10 * * * *"
      },
      {
        logger,
        cronScheduler: scheduler,
        catalogService,
        syncService
      }
    );

    expect(controller.startCalls).toBe(1);
    await controller.runScheduled();
    expect(catalogService.fetchCatalogItems).toHaveBeenCalledTimes(1);
    expect(syncService.syncCatalogObjects).toHaveBeenCalledTimes(1);

    job.stop();
    expect(controller.stopCalls).toBe(1);
    expect(logger.info).toHaveBeenCalledWith("[square-sync] scheduler stopped");
  });

  it("skips overlapping runs and logs failures without throwing", async () => {
    const logger = createLoggerMock();
    const { scheduler } = createManualCronScheduler();

    let releaseFetch: () => void = () => {
      // Placeholder gets replaced inside promise executor.
    };
    const pendingFetch = new Promise<unknown[]>((resolve) => {
      releaseFetch = () => resolve([]);
    });

    const catalogService = {
      fetchCatalogItems: vi.fn().mockImplementation(() => pendingFetch)
    };
    const syncService = {
      syncCatalogObjects: vi.fn().mockRejectedValue(new Error("sync boom"))
    };

    const job = createSquareSyncJob(
      {
        enabled: true,
        cronExpression: "*/10 * * * *"
      },
      {
        logger,
        cronScheduler: scheduler,
        catalogService,
        syncService
      }
    );

    const firstRun = job.triggerNow();
    await job.triggerNow();

    expect(logger.warn).toHaveBeenCalledWith(
      "[square-sync] skipped run because a previous run is still in progress"
    );

    releaseFetch();
    await firstRun;

    expect(logger.error).toHaveBeenCalledWith("[square-sync] run failed", expect.any(Error));
  });
});

describe("createNodeCronScheduler", () => {
  it("creates a schedulable task for a valid cron expression", () => {
    const scheduler = createNodeCronScheduler();

    const task = scheduler.schedule("* * * * *", async () => { });

    expect(typeof task.start).toBe("function");
    expect(typeof task.stop).toBe("function");
    task.start();
    task.stop();
  });

  it("throws for an invalid cron expression", () => {
    const scheduler = createNodeCronScheduler();

    expect(() => scheduler.schedule("not a cron", async () => { })).toThrow(
      "Invalid SQUARE_SYNC_CRON expression: not a cron"
    );
  });
});
