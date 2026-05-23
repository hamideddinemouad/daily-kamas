import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import { SERVER_OPTIONS, type ServerOption } from "@/lib/constants";

type DashboardData = {
  entries: {
    id: string;
    server: ServerOption;
    date: string;
    revenu: string;
    createdAt: string;
    updatedAt: string;
  }[];
  totalsByServer: Record<ServerOption, string>;
  averageByServer: Record<ServerOption, string>;
  activeDaysByServer: Record<ServerOption, number>;
  grandTotal: string;
  grandAveragePerDay: string;
  activeDayCount: number;
  missingServersInLast24Hours: ServerOption[];
  databaseConfigured: boolean;
  dashboardDataError: string | null;
};

export type StatResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export type SummaryStat = {
  label: string;
  value: string;
  detail?: string;
};

export type MultiValueStat = {
  rows: SummaryStat[];
};

export type SingleValueStat = {
  value: string;
  detail?: string;
};

export type DashboardSnapshot = {
  todayTotal: StatResult<SingleValueStat>;
  todayCoverage: StatResult<SingleValueStat>;
  bestServer: StatResult<SingleValueStat>;
  bestServerToday: StatResult<SingleValueStat>;
  averagePerEntry: StatResult<SingleValueStat>;
  entriesCountPerServer: StatResult<MultiValueStat>;
  sevenDayTotalPerServer: StatResult<MultiValueStat>;
  sevenDayAveragePerDay: StatResult<MultiValueStat>;
  lastEntryTimePerServer: StatResult<MultiValueStat>;
  highestSingleEntry: StatResult<SingleValueStat>;
  shareOfTotal: StatResult<MultiValueStat>;
};

function createFailedSnapshot(message: string): DashboardSnapshot {
  const failed = <T,>(): StatResult<T> => ({
    ok: false,
    message,
  });

  return {
    todayTotal: failed(),
    todayCoverage: failed(),
    bestServer: failed(),
    bestServerToday: failed(),
    averagePerEntry: failed(),
    entriesCountPerServer: failed(),
    sevenDayTotalPerServer: failed(),
    sevenDayAveragePerDay: failed(),
    lastEntryTimePerServer: failed(),
    highestSingleEntry: failed(),
    shareOfTotal: failed(),
  };
}

function calculateAverage(total: string, dayCount: number) {
  const numericTotal = Number.parseFloat(total);

  if (!Number.isFinite(numericTotal) || dayCount <= 0) {
    return "0";
  }

  return (numericTotal / dayCount).toString();
}

function createEmptyStringRecord() {
  return SERVER_OPTIONS.reduce<Record<ServerOption, string>>(
    (accumulator, server) => {
      accumulator[server] = "0";
      return accumulator;
    },
    {} as Record<ServerOption, string>,
  );
}

function createEmptyNumberRecord() {
  return SERVER_OPTIONS.reduce<Record<ServerOption, number>>(
    (accumulator, server) => {
      accumulator[server] = 0;
      return accumulator;
    },
    {} as Record<ServerOption, number>,
  );
}

function createEmptyDashboardData(
  databaseConfigured: boolean,
  dashboardDataError: string | null = null,
): DashboardData {
  return {
    entries: [],
    totalsByServer: createEmptyStringRecord(),
    averageByServer: createEmptyStringRecord(),
    activeDaysByServer: createEmptyNumberRecord(),
    grandTotal: "0",
    grandAveragePerDay: "0",
    activeDayCount: 0,
    missingServersInLast24Hours: [],
    databaseConfigured,
    dashboardDataError,
  };
}

function createUtcDayRange(offsetDays = 0) {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function createUtcRollingRange(days: number) {
  const { end } = createUtcDayRange(1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);

  return { start, end };
}

function createUtcMonthRange(referenceDate = new Date()) {
  const start = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 1),
  );

  return { start, end };
}

function getDaysInUtcMonth(referenceDate = new Date()) {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

async function getSafeStat<T>(loader: () => Promise<T>): Promise<StatResult<T>> {
  try {
    return {
      ok: true,
      value: await loader(),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getDashboardData() {
  if (!isDatabaseConfigured()) {
    return createEmptyDashboardData(false);
  }

  try {
    const prisma = getPrismaClient();
    const monthRange = createUtcMonthRange();
    const daysInMonth = getDaysInUtcMonth();
    const [entries, groupedTotals, grandTotalAggregate] = await Promise.all([
      prisma.revenueEntry.findMany({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      prisma.revenueEntry.groupBy({
        by: ["server"],
        _sum: { revenu: true },
      }),
      prisma.revenueEntry.aggregate({
        where: {
          date: {
            gte: monthRange.start,
            lt: monthRange.end,
          },
        },
        _sum: { revenu: true },
      }),
    ]);

    const totalsByServer = createEmptyStringRecord();
    const activeDaysByServer = createEmptyNumberRecord();

    for (const item of groupedTotals) {
      totalsByServer[item.server] = item._sum.revenu?.toString() ?? "0";
    }

    for (const server of SERVER_OPTIONS) {
      const serverDays = new Set(
        entries
          .filter(
            (entry) =>
              entry.server === server &&
              Number.parseFloat(entry.revenu.toString()) > 0,
          )
          .map((entry) => entry.date.toISOString().slice(0, 10)),
      );

      activeDaysByServer[server] = serverDays.size;
    }

    const averageByServer = SERVER_OPTIONS.reduce<Record<ServerOption, string>>(
      (accumulator, server) => {
        accumulator[server] = calculateAverage(
          totalsByServer[server],
          activeDaysByServer[server],
        );
        return accumulator;
      },
      {} as Record<ServerOption, string>,
    );

    const grandTotal = grandTotalAggregate._sum.revenu?.toString() ?? "0";
    const recentThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentServers = new Set(
      entries
        .filter((entry) => entry.createdAt >= recentThreshold)
        .map((entry) => entry.server),
    );
    const missingServersInLast24Hours = SERVER_OPTIONS.filter(
      (server) => !recentServers.has(server),
    );

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        server: entry.server,
        date: entry.date.toISOString(),
        revenu: entry.revenu.toString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
      totalsByServer,
      averageByServer,
      activeDaysByServer,
      grandTotal,
      grandAveragePerDay: calculateAverage(grandTotal, daysInMonth),
      activeDayCount: daysInMonth,
      missingServersInLast24Hours,
      databaseConfigured: true,
      dashboardDataError: null,
    };
  } catch (error) {
    return createEmptyDashboardData(
      true,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  if (!isDatabaseConfigured()) {
    const emptyRows = SERVER_OPTIONS.map((server) => ({
      label: server,
      value: "0",
    }));

    return {
      todayTotal: { ok: true, value: { value: "0", detail: "No database yet" } },
      todayCoverage: {
        ok: true,
        value: { value: `0/${SERVER_OPTIONS.length}`, detail: "No database yet" },
      },
      bestServer: { ok: true, value: { value: "None", detail: "No entries yet" } },
      bestServerToday: {
        ok: true,
        value: { value: "None", detail: "No entries yet today" },
      },
      averagePerEntry: { ok: true, value: { value: "0", detail: "0 entries" } },
      entriesCountPerServer: { ok: true, value: { rows: emptyRows } },
      sevenDayTotalPerServer: { ok: true, value: { rows: emptyRows } },
      sevenDayAveragePerDay: { ok: true, value: { rows: emptyRows } },
      lastEntryTimePerServer: {
        ok: true,
        value: {
          rows: SERVER_OPTIONS.map((server) => ({
            label: server,
            value: "No entries yet",
          })),
        },
      },
      highestSingleEntry: {
        ok: true,
        value: { value: "0", detail: "No entries yet" },
      },
      shareOfTotal: { ok: true, value: { rows: emptyRows } },
    };
  }

  let prisma: ReturnType<typeof getPrismaClient>;

  try {
    prisma = getPrismaClient();
  } catch (error) {
    return createFailedSnapshot(
      error instanceof Error ? error.message : "Unknown error",
    );
  }

  const todayRange = createUtcDayRange();
  const sevenDayRange = createUtcRollingRange(7);

  const [
    todayTotal,
    todayCoverage,
    bestServer,
    bestServerToday,
    averagePerEntry,
    entriesCountPerServer,
    sevenDayTotalPerServer,
    sevenDayAveragePerDay,
    lastEntryTimePerServer,
    highestSingleEntry,
    shareOfTotal,
  ] = await Promise.all([
    getSafeStat(async () => {
      const aggregate = await prisma.revenueEntry.aggregate({
        where: {
          date: {
            gte: todayRange.start,
            lt: todayRange.end,
          },
        },
        _sum: { revenu: true },
      });

      return {
        value: aggregate._sum.revenu?.toString() ?? "0",
        detail: todayRange.start.toISOString().slice(0, 10),
      };
    }),
    getSafeStat(async () => {
      const grouped = await prisma.revenueEntry.groupBy({
        by: ["server"],
        where: {
          date: {
            gte: todayRange.start,
            lt: todayRange.end,
          },
        },
      });

      return {
        value: `${grouped.length}/${SERVER_OPTIONS.length}`,
        detail:
          grouped.length === SERVER_OPTIONS.length
            ? "All servers covered today"
            : `${SERVER_OPTIONS.length - grouped.length} server(s) still missing`,
      };
    }),
    getSafeStat(async () => {
      const grouped = await prisma.revenueEntry.groupBy({
        by: ["server"],
        _sum: { revenu: true },
      });
      const best = grouped.reduce<(typeof grouped)[number] | null>(
        (currentBest, item) => {
          if (!currentBest) {
            return item;
          }

          const currentValue = Number.parseFloat(
            currentBest._sum.revenu?.toString() ?? "0",
          );
          const nextValue = Number.parseFloat(item._sum.revenu?.toString() ?? "0");

          return nextValue > currentValue ? item : currentBest;
        },
        null,
      );

      return best
        ? {
            value: best.server,
            detail: best._sum.revenu?.toString() ?? "0",
          }
        : {
            value: "None",
            detail: "No entries yet",
          };
    }),
    getSafeStat(async () => {
      const grouped = await prisma.revenueEntry.groupBy({
        by: ["server"],
        where: {
          date: {
            gte: todayRange.start,
            lt: todayRange.end,
          },
        },
        _sum: { revenu: true },
      });
      const best = grouped.reduce<(typeof grouped)[number] | null>(
        (currentBest, item) => {
          if (!currentBest) {
            return item;
          }

          const currentValue = Number.parseFloat(
            currentBest._sum.revenu?.toString() ?? "0",
          );
          const nextValue = Number.parseFloat(item._sum.revenu?.toString() ?? "0");

          return nextValue > currentValue ? item : currentBest;
        },
        null,
      );

      return best
        ? {
            value: best.server,
            detail: best._sum.revenu?.toString() ?? "0",
          }
        : {
            value: "None",
            detail: "No entries yet today",
          };
    }),
    getSafeStat(async () => {
      const aggregate = await prisma.revenueEntry.aggregate({
        _avg: { revenu: true },
        _count: { _all: true },
      });

      return {
        value: aggregate._avg.revenu?.toString() ?? "0",
        detail: `${aggregate._count._all} entries`,
      };
    }),
    getSafeStat(async () => {
      const grouped = await prisma.revenueEntry.groupBy({
        by: ["server"],
        _count: { _all: true },
      });
      const counts = SERVER_OPTIONS.reduce<Record<ServerOption, number>>(
        (accumulator, server) => {
          accumulator[server] = 0;
          return accumulator;
        },
        {} as Record<ServerOption, number>,
      );

      for (const item of grouped) {
        counts[item.server] = item._count._all;
      }

      return {
        rows: SERVER_OPTIONS.map((server) => ({
          label: server,
          value: counts[server].toString(),
        })),
      };
    }),
    getSafeStat(async () => {
      const grouped = await prisma.revenueEntry.groupBy({
        by: ["server"],
        where: {
          date: {
            gte: sevenDayRange.start,
            lt: sevenDayRange.end,
          },
        },
        _sum: { revenu: true },
      });
      const totals = createEmptyStringRecord();

      for (const item of grouped) {
        totals[item.server] = item._sum.revenu?.toString() ?? "0";
      }

      return {
        rows: SERVER_OPTIONS.map((server) => ({
          label: server,
          value: totals[server],
        })),
      };
    }),
    getSafeStat(async () => {
      const grouped = await prisma.revenueEntry.groupBy({
        by: ["server"],
        where: {
          date: {
            gte: sevenDayRange.start,
            lt: sevenDayRange.end,
          },
        },
        _sum: { revenu: true },
      });
      const totals = createEmptyStringRecord();

      for (const item of grouped) {
        totals[item.server] = item._sum.revenu?.toString() ?? "0";
      }

      return {
        rows: SERVER_OPTIONS.map((server) => ({
          label: server,
          value: calculateAverage(totals[server], 7),
        })),
      };
    }),
    getSafeStat(async () => {
      const entries = await prisma.revenueEntry.findMany({
        select: {
          server: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      const latestByServer = new Map<ServerOption, Date>();

      for (const entry of entries) {
        if (!latestByServer.has(entry.server)) {
          latestByServer.set(entry.server, entry.createdAt);
        }
      }

      return {
        rows: SERVER_OPTIONS.map((server) => ({
          label: server,
          value: latestByServer.has(server)
            ? latestByServer.get(server)?.toISOString() ?? ""
            : "No entries yet",
        })),
      };
    }),
    getSafeStat(async () => {
      const entry = await prisma.revenueEntry.findFirst({
        orderBy: [{ revenu: "desc" }, { createdAt: "desc" }],
      });

      return entry
        ? {
            value: entry.revenu.toString(),
            detail: `${entry.server} · ${entry.date.toISOString().slice(0, 10)}`,
          }
        : {
            value: "0",
            detail: "No entries yet",
          };
    }),
    getSafeStat(async () => {
      const [grouped, aggregate] = await Promise.all([
        prisma.revenueEntry.groupBy({
          by: ["server"],
          _sum: { revenu: true },
        }),
        prisma.revenueEntry.aggregate({
          _sum: { revenu: true },
        }),
      ]);

      const totals = createEmptyStringRecord();
      const grandTotal = Number.parseFloat(aggregate._sum.revenu?.toString() ?? "0");

      for (const item of grouped) {
        totals[item.server] = item._sum.revenu?.toString() ?? "0";
      }

      return {
        rows: SERVER_OPTIONS.map((server) => {
          const serverTotal = Number.parseFloat(totals[server]);
          const share =
            grandTotal > 0 ? ((serverTotal / grandTotal) * 100).toFixed(1) : "0.0";

          return {
            label: server,
            value: `${share}%`,
            detail: totals[server],
          };
        }),
      };
    }),
  ]);

  return {
    todayTotal,
    todayCoverage,
    bestServer,
    bestServerToday,
    averagePerEntry,
    entriesCountPerServer,
    sevenDayTotalPerServer,
    sevenDayAveragePerDay,
    lastEntryTimePerServer,
    highestSingleEntry,
    shareOfTotal,
  };
}
