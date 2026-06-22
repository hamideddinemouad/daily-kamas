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
  todayTotal: string;
  grandAveragePerDay: string;
  activeDayCount: number;
  serverEntryStatusToday: {
    server: ServerOption;
    hasEntryToday: boolean;
  }[];
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

export type GroupedMultiValueStat = {
  groups: {
    label: string;
    rows: SummaryStat[];
  }[];
};

export type SingleValueStat = {
  value: string;
  detail?: string;
};

export type DashboardSnapshot = {
  todayTotal: StatResult<SingleValueStat>;
  todayTotalPerServer: StatResult<MultiValueStat>;
  todayCoverage: StatResult<SingleValueStat>;
  bestServer: StatResult<SingleValueStat>;
  bestServerToday: StatResult<SingleValueStat>;
  bestDayEver: StatResult<SingleValueStat>;
  averagePerEntry: StatResult<SingleValueStat>;
  entriesCountPerServer: StatResult<MultiValueStat>;
  sevenDayTotal: StatResult<SingleValueStat>;
  sevenDayDailyTotalsAllServers: StatResult<MultiValueStat>;
  thirtyDayDailyTotalsAllServers: StatResult<MultiValueStat>;
  sevenDayTotalPerServer: StatResult<MultiValueStat>;
  sevenDayTotalBreakdown: StatResult<GroupedMultiValueStat>;
  thirtyDayTotalBreakdown: StatResult<GroupedMultiValueStat>;
  sevenDayAveragePerDay: StatResult<MultiValueStat>;
  allTimeAveragePerDayPerServer: StatResult<MultiValueStat>;
  lastEntryTimePerServer: StatResult<MultiValueStat>;
  highestSingleEntry: StatResult<SingleValueStat>;
  shareOfTotal: StatResult<MultiValueStat>;
};

export type ServerBreakdownRows = {
  rows: SummaryStat[];
};

export type RevenueEntriesPageData = {
  entries: {
    id: string;
    server: ServerOption;
    date: string;
    revenu: string;
    createdAt: string;
    updatedAt: string;
  }[];
  totalCount: number;
  databaseConfigured: boolean;
  entriesDataError: string | null;
};

export const SNAPSHOT_STAT_KEYS = [
  "todayTotal",
  "todayTotalPerServer",
  "bestServerToday",
  "sevenDayTotal",
  "sevenDayDailyTotalsAllServers",
  "sevenDayTotalPerServer",
  "sevenDayAveragePerDay",
  "allTimeAveragePerDay",
  "allTimeAveragePerDayPerServer",
  "shareOfTotal",
  "bestDayEver",
  "bestServer",
  "highestSingleEntry",
] as const;

export type SnapshotStatKey = (typeof SNAPSHOT_STAT_KEYS)[number];

export type SnapshotStatResponse =
  | {
      kind: "single";
      result: StatResult<SingleValueStat>;
    }
  | {
      kind: "list";
      result: StatResult<MultiValueStat>;
    };

function createFailedSnapshot(message: string): DashboardSnapshot {
  const failed = <T,>(): StatResult<T> => ({
    ok: false,
    message,
  });

  return {
    todayTotal: failed(),
    todayTotalPerServer: failed(),
    todayCoverage: failed(),
    bestServer: failed(),
    bestServerToday: failed(),
    bestDayEver: failed(),
    averagePerEntry: failed(),
    entriesCountPerServer: failed(),
    sevenDayTotal: failed(),
    sevenDayDailyTotalsAllServers: failed(),
    thirtyDayDailyTotalsAllServers: failed(),
    sevenDayTotalPerServer: failed(),
    sevenDayTotalBreakdown: failed(),
    thirtyDayTotalBreakdown: failed(),
    sevenDayAveragePerDay: failed(),
    allTimeAveragePerDayPerServer: failed(),
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

function createEmptySummaryRows() {
  return SERVER_OPTIONS.map((server) => ({
    label: server,
    value: "0",
  }));
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
    todayTotal: "0",
    grandAveragePerDay: "0",
    activeDayCount: 0,
    serverEntryStatusToday: SERVER_OPTIONS.map((server) => ({
      server,
      hasEntryToday: false,
    })),
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
  const { end } = createUtcDayRange();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);

  return { start, end };
}

function createRecentUtcDateKeys(days: number) {
  const { start } = createUtcDayRange();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() - index);
    return date.toISOString().slice(0, 10);
  });
}

function calculateCalendarDaysSinceFirstEntry(firstDate: Date | null | undefined) {
  if (!firstDate) {
    return 0;
  }

  const todayUtc = createUtcDayRange().start;
  const firstUtc = new Date(
    Date.UTC(
      firstDate.getUTCFullYear(),
      firstDate.getUTCMonth(),
      firstDate.getUTCDate(),
    ),
  );
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const differenceInDays = Math.floor(
    (todayUtc.getTime() - firstUtc.getTime()) / millisecondsPerDay,
  );

  return Math.max(0, differenceInDays) + 1;
}

async function getRollingBreakdownForServer(
  server: ServerOption,
  days: number,
): Promise<ServerBreakdownRows> {
  if (!isDatabaseConfigured()) {
    return {
      rows: createRecentUtcDateKeys(days).map((date) => ({
        label: date,
        value: "0",
      })),
    };
  }

  const prisma = getPrismaClient();
  const range = createUtcRollingRange(days);
  const recentDateKeys = createRecentUtcDateKeys(days);
  const entries = await prisma.revenueEntry.findMany({
    where: {
      server,
      date: {
        gte: range.start,
        lt: range.end,
      },
    },
    select: {
      date: true,
      revenu: true,
    },
  });

  const totalsByDate = new Map<string, number>();

  for (const entry of entries) {
    const dayKey = entry.date.toISOString().slice(0, 10);
    const previousValue = totalsByDate.get(dayKey) ?? 0;

    totalsByDate.set(
      dayKey,
      previousValue + Number.parseFloat(entry.revenu.toString()),
    );
  }

  return {
    rows: recentDateKeys.map((date) => ({
      label: date,
      value: (totalsByDate.get(date) ?? 0).toString(),
      })),
  };
}

export async function getSevenDayBreakdownForServer(
  server: ServerOption,
): Promise<ServerBreakdownRows> {
  return getRollingBreakdownForServer(server, 7);
}

export async function getThirtyDayBreakdownForServer(
  server: ServerOption,
): Promise<ServerBreakdownRows> {
  return getRollingBreakdownForServer(server, 30);
}

export async function getThirtyDayDailyTotalsAllServersStat(): Promise<
  StatResult<MultiValueStat>
> {
  if (!isDatabaseConfigured()) {
    return {
      ok: true,
      value: {
        rows: createRecentUtcDateKeys(30).map((date) => ({
          label: date,
          value: "0",
        })),
      },
    };
  }

  try {
    const prisma = getPrismaClient();
    const thirtyDayRange = createUtcRollingRange(30);
    const thirtyDayDateKeys = createRecentUtcDateKeys(30);
    const entries = await prisma.revenueEntry.findMany({
      where: {
        date: {
          gte: thirtyDayRange.start,
          lt: thirtyDayRange.end,
        },
      },
      select: {
        date: true,
        revenu: true,
      },
    });

    const totalsByDate = new Map<string, number>();

    for (const entry of entries) {
      const dayKey = entry.date.toISOString().slice(0, 10);
      const previousValue = totalsByDate.get(dayKey) ?? 0;

      totalsByDate.set(
        dayKey,
        previousValue + Number.parseFloat(entry.revenu.toString()),
      );
    }

    return {
      ok: true,
      value: {
        rows: thirtyDayDateKeys.map((date) => ({
          label: date,
          value: (totalsByDate.get(date) ?? 0).toString(),
        })),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getRecentRevenueEntriesPageData(
  limit = 10,
  offset = 0,
): Promise<RevenueEntriesPageData> {
  if (!isDatabaseConfigured()) {
    return {
      entries: [],
      totalCount: 0,
      databaseConfigured: false,
      entriesDataError: null,
    };
  }

  try {
    const prisma = getPrismaClient();
    const [entries, totalCount] = await Promise.all([
      prisma.revenueEntry.findMany({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
      }),
      prisma.revenueEntry.count(),
    ]);

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        server: entry.server,
        date: entry.date.toISOString(),
        revenu: entry.revenu.toString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
      totalCount,
      databaseConfigured: true,
      entriesDataError: null,
    };
  } catch (error) {
    return {
      entries: [],
      totalCount: 0,
      databaseConfigured: true,
      entriesDataError: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSnapshotStatData(
  key: SnapshotStatKey,
): Promise<SnapshotStatResponse> {
  if (!isDatabaseConfigured()) {
    const emptyRows = createEmptySummaryRows();

    switch (key) {
      case "todayTotal":
        return {
          kind: "single",
          result: { ok: true, value: { value: "0", detail: "No database yet" } },
        };
      case "todayTotalPerServer":
        return { kind: "list", result: { ok: true, value: { rows: emptyRows } } };
      case "bestServerToday":
        return {
          kind: "single",
          result: {
            ok: true,
            value: { value: "None", detail: "No entries yet today" },
          },
        };
      case "sevenDayTotal":
        return {
          kind: "single",
          result: { ok: true, value: { value: "0", detail: "No database yet" } },
        };
      case "sevenDayDailyTotalsAllServers":
        return {
          kind: "list",
          result: {
            ok: true,
            value: {
              rows: createRecentUtcDateKeys(7).map((date) => ({
                label: date,
                value: "0",
              })),
            },
          },
        };
      case "sevenDayTotalPerServer":
        return { kind: "list", result: { ok: true, value: { rows: emptyRows } } };
      case "sevenDayAveragePerDay":
        return { kind: "list", result: { ok: true, value: { rows: emptyRows } } };
      case "allTimeAveragePerDay":
        return {
          kind: "single",
          result: { ok: true, value: { value: "0", detail: "No database yet" } },
        };
      case "allTimeAveragePerDayPerServer":
        return { kind: "list", result: { ok: true, value: { rows: emptyRows } } };
      case "shareOfTotal":
        return { kind: "list", result: { ok: true, value: { rows: emptyRows } } };
      case "bestDayEver":
        return {
          kind: "single",
          result: { ok: true, value: { value: "0", detail: "No entries yet" } },
        };
      case "bestServer":
        return {
          kind: "single",
          result: {
            ok: true,
            value: { value: "None", detail: "No entries yet" },
          },
        };
      case "highestSingleEntry":
        return {
          kind: "single",
          result: { ok: true, value: { value: "0", detail: "No entries yet" } },
        };
    }
  }

  let prisma: ReturnType<typeof getPrismaClient>;

  try {
    prisma = getPrismaClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return key === "todayTotalPerServer" ||
      key === "sevenDayDailyTotalsAllServers" ||
      key === "sevenDayTotalPerServer" ||
      key === "sevenDayAveragePerDay" ||
      key === "allTimeAveragePerDayPerServer" ||
      key === "shareOfTotal"
      ? { kind: "list", result: { ok: false, message } }
      : { kind: "single", result: { ok: false, message } };
  }

  const todayRange = createUtcDayRange();
  const sevenDayRange = createUtcRollingRange(7);
  const recentDateKeys = createRecentUtcDateKeys(7);

  switch (key) {
    case "todayTotal":
      return {
        kind: "single",
        result: await getSafeStat(async () => {
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
      };
    case "todayTotalPerServer":
      return {
        kind: "list",
        result: await getSafeStat(async () => {
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
      };
    case "bestServerToday":
      return {
        kind: "single",
        result: await getSafeStat(async () => {
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
              const nextValue = Number.parseFloat(
                item._sum.revenu?.toString() ?? "0",
              );

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
      };
    case "sevenDayTotal":
      return {
        kind: "single",
        result: await getSafeStat(async () => {
          const aggregate = await prisma.revenueEntry.aggregate({
            where: {
              date: {
                gte: sevenDayRange.start,
                lt: sevenDayRange.end,
              },
            },
            _sum: { revenu: true },
          });

          const startLabel = sevenDayRange.start.toISOString().slice(0, 10);
          const endLabel = new Date(
            sevenDayRange.end.getTime() - 1,
          ).toISOString().slice(0, 10);

          return {
            value: aggregate._sum.revenu?.toString() ?? "0",
            detail: `${startLabel} to ${endLabel}`,
          };
        }),
      };
    case "sevenDayDailyTotalsAllServers":
      return {
        kind: "list",
        result: await getSafeStat(async () => {
          const entries = await prisma.revenueEntry.findMany({
            where: {
              date: {
                gte: sevenDayRange.start,
                lt: sevenDayRange.end,
              },
            },
            select: {
              date: true,
              revenu: true,
            },
          });

          const totalsByDate = new Map<string, number>();

          for (const entry of entries) {
            const dayKey = entry.date.toISOString().slice(0, 10);
            const previousValue = totalsByDate.get(dayKey) ?? 0;

            totalsByDate.set(
              dayKey,
              previousValue + Number.parseFloat(entry.revenu.toString()),
            );
          }

          return {
            rows: recentDateKeys.map((date) => ({
              label: date,
              value: (totalsByDate.get(date) ?? 0).toString(),
            })),
          };
        }),
      };
    case "sevenDayTotalPerServer":
      return {
        kind: "list",
        result: await getSafeStat(async () => {
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
      };
    case "sevenDayAveragePerDay":
      return {
        kind: "list",
        result: await getSafeStat(async () => {
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
      };
    case "allTimeAveragePerDay":
      return {
        kind: "single",
        result: await getSafeStat(async () => {
          const aggregate = await prisma.revenueEntry.aggregate({
            _sum: { revenu: true },
            _min: { date: true },
          });

          const calendarDayCount = calculateCalendarDaysSinceFirstEntry(
            aggregate._min.date,
          );
          const total = aggregate._sum.revenu?.toString() ?? "0";
          const firstDateLabel = aggregate._min.date?.toISOString().slice(0, 10);

          return {
            value: calculateAverage(total, calendarDayCount),
            detail: firstDateLabel
              ? `${calendarDayCount} calendar ${
                  calendarDayCount === 1 ? "day" : "days"
                } since ${firstDateLabel}`
              : "No entries yet",
          };
        }),
      };
    case "allTimeAveragePerDayPerServer":
      return {
        kind: "list",
        result: await getSafeStat(async () => {
          const [groupedTotals, earliestEntry] = await Promise.all([
            prisma.revenueEntry.groupBy({
              by: ["server"],
              _sum: { revenu: true },
            }),
            prisma.revenueEntry.aggregate({
              _min: { date: true },
            }),
          ]);

          const totals = createEmptyStringRecord();
          const sharedCalendarDayCount = calculateCalendarDaysSinceFirstEntry(
            earliestEntry._min.date,
          );
          const sharedFirstDateLabel = earliestEntry._min.date
            ?.toISOString()
            .slice(0, 10);

          for (const item of groupedTotals) {
            totals[item.server] = item._sum.revenu?.toString() ?? "0";
          }

          return {
            rows: SERVER_OPTIONS.map((server) => ({
              label: server,
              value: calculateAverage(totals[server], sharedCalendarDayCount),
              detail: sharedFirstDateLabel
                ? `${sharedCalendarDayCount} calendar ${
                    sharedCalendarDayCount === 1 ? "day" : "days"
                  } since ${sharedFirstDateLabel}`
                : "No entries yet",
            })),
          };
        }),
      };
    case "shareOfTotal":
      return {
        kind: "list",
        result: await getSafeStat(async () => {
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
          const grandTotal = Number.parseFloat(
            aggregate._sum.revenu?.toString() ?? "0",
          );

          for (const item of grouped) {
            totals[item.server] = item._sum.revenu?.toString() ?? "0";
          }

          return {
            rows: SERVER_OPTIONS.map((server) => {
              const serverTotal = Number.parseFloat(totals[server]);
              const share =
                grandTotal > 0
                  ? ((serverTotal / grandTotal) * 100).toFixed(1)
                  : "0.0";

              return {
                label: server,
                value: `${share}%`,
                detail: totals[server],
              };
            }),
          };
        }),
      };
    case "bestDayEver":
      return {
        kind: "single",
        result: await getSafeStat(async () => getBestDailyTotal(prisma)),
      };
    case "bestServer":
      return {
        kind: "single",
        result: await getSafeStat(async () => {
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
              const nextValue = Number.parseFloat(
                item._sum.revenu?.toString() ?? "0",
              );

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
      };
    case "highestSingleEntry":
      return {
        kind: "single",
        result: await getSafeStat(async () => {
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
      };
  }
}

function createEmptyGroupedPeriodBreakdown(days: number): GroupedMultiValueStat {
  const recentDateKeys = createRecentUtcDateKeys(days);

  return {
    groups: SERVER_OPTIONS.map((server) => ({
      label: server,
      rows: recentDateKeys.map((date) => ({
        label: date,
        value: "0",
      })),
    })),
  };
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

function getElapsedUtcDaysInMonth(referenceDate = new Date()) {
  return referenceDate.getUTCDate();
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

async function getBestDailyTotal(
  prisma: ReturnType<typeof getPrismaClient>,
): Promise<SingleValueStat> {
  const entries = await prisma.revenueEntry.findMany({
    select: {
      date: true,
      revenu: true,
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const totalsByDate = new Map<string, number>();

  for (const entry of entries) {
    const dayKey = entry.date.toISOString().slice(0, 10);
    const previousTotal = totalsByDate.get(dayKey) ?? 0;

    totalsByDate.set(
      dayKey,
      previousTotal + Number.parseFloat(entry.revenu.toString()),
    );
  }

  if (totalsByDate.size === 0) {
    return {
      value: "0",
      detail: "No entries yet",
    };
  }

  let selectedDay: { date: string; total: number } | null = null;

  for (const [date, total] of totalsByDate.entries()) {
    if (!selectedDay || total > selectedDay.total) {
      selectedDay = { date, total };
    }
  }

  if (!selectedDay) {
    return {
      value: "0",
      detail: "No entries yet",
    };
  }

  return {
    value: selectedDay.total.toString(),
    // This reflects the combined total for all entries recorded on that UTC date.
    detail: selectedDay.date,
  };
}

export async function getDashboardData() {
  if (!isDatabaseConfigured()) {
    return createEmptyDashboardData(false);
  }

  try {
    const prisma = getPrismaClient();
    const monthRange = createUtcMonthRange();
    const todayRange = createUtcDayRange();
    // The dashboard's monthly average is based on days elapsed so far in the
    // current UTC month, including today.
    const elapsedDaysInMonth = getElapsedUtcDaysInMonth();
    const [entries, groupedTotals, grandTotalAggregate, todayTotalAggregate] =
      await Promise.all([
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
      prisma.revenueEntry.aggregate({
        where: {
          date: {
            gte: todayRange.start,
            lt: todayRange.end,
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
    const todayTotal = todayTotalAggregate._sum.revenu?.toString() ?? "0";
    // Business rule: the daily entry checklist resets at midnight UTC, not
    // exactly 24 hours after the last entry was created.
    const serversWithEntryToday = new Set(
      entries
        .filter(
          (entry) =>
            entry.date >= todayRange.start && entry.date < todayRange.end,
        )
        .map((entry) => entry.server),
    );
    const serverEntryStatusToday = SERVER_OPTIONS.map((server) => ({
      server,
      hasEntryToday: serversWithEntryToday.has(server),
    }));

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
      todayTotal,
      grandAveragePerDay: calculateAverage(grandTotal, elapsedDaysInMonth),
      activeDayCount: elapsedDaysInMonth,
      serverEntryStatusToday,
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
      todayTotalPerServer: { ok: true, value: { rows: emptyRows } },
      todayCoverage: {
        ok: true,
        value: { value: `0/${SERVER_OPTIONS.length}`, detail: "No database yet" },
      },
      bestServer: { ok: true, value: { value: "None", detail: "No entries yet" } },
      bestServerToday: {
        ok: true,
        value: { value: "None", detail: "No entries yet today" },
      },
      bestDayEver: { ok: true, value: { value: "0", detail: "No entries yet" } },
      averagePerEntry: { ok: true, value: { value: "0", detail: "0 entries" } },
      entriesCountPerServer: { ok: true, value: { rows: emptyRows } },
      sevenDayTotal: {
        ok: true,
        value: { value: "0", detail: "No database yet" },
      },
      sevenDayDailyTotalsAllServers: {
        ok: true,
        value: {
          rows: createRecentUtcDateKeys(7).map((date) => ({
            label: date,
            value: "0",
          })),
        },
      },
      thirtyDayDailyTotalsAllServers: {
        ok: true,
        value: {
          rows: createRecentUtcDateKeys(30).map((date) => ({
            label: date,
            value: "0",
          })),
        },
      },
      sevenDayTotalPerServer: { ok: true, value: { rows: emptyRows } },
      sevenDayTotalBreakdown: {
        ok: true,
        value: createEmptyGroupedPeriodBreakdown(7),
      },
      thirtyDayTotalBreakdown: {
        ok: true,
        value: createEmptyGroupedPeriodBreakdown(30),
      },
      sevenDayAveragePerDay: { ok: true, value: { rows: emptyRows } },
      allTimeAveragePerDayPerServer: { ok: true, value: { rows: emptyRows } },
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
  const thirtyDayRange = createUtcRollingRange(30);
  const recentDateKeys = createRecentUtcDateKeys(7);
  const thirtyDayDateKeys = createRecentUtcDateKeys(30);

  const [
    todayTotal,
    sevenDayTotal,
    todayTotalPerServer,
    todayCoverage,
    bestServer,
    bestServerToday,
    bestDayEver,
    averagePerEntry,
    entriesCountPerServer,
    sevenDayTotalPerServer,
    sevenDayDailyTotalsAllServers,
    thirtyDayDailyTotalsAllServers,
    sevenDayTotalBreakdown,
    thirtyDayTotalBreakdown,
    sevenDayAveragePerDay,
    allTimeAveragePerDayPerServer,
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
      const aggregate = await prisma.revenueEntry.aggregate({
        where: {
          date: {
            gte: sevenDayRange.start,
            lt: sevenDayRange.end,
          },
        },
        _sum: { revenu: true },
      });

      const startLabel = sevenDayRange.start.toISOString().slice(0, 10);
      const endLabel = new Date(
        sevenDayRange.end.getTime() - 1,
      ).toISOString().slice(0, 10);

      return {
        value: aggregate._sum.revenu?.toString() ?? "0",
        detail: `${startLabel} to ${endLabel}`,
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
    getSafeStat(async () => getBestDailyTotal(prisma)),
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
      const entries = await prisma.revenueEntry.findMany({
        where: {
          date: {
            gte: sevenDayRange.start,
            lt: sevenDayRange.end,
          },
        },
        select: {
          date: true,
          revenu: true,
        },
      });

      const totalsByDate = new Map<string, number>();

      for (const entry of entries) {
        const dayKey = entry.date.toISOString().slice(0, 10);
        const previousValue = totalsByDate.get(dayKey) ?? 0;

        totalsByDate.set(
          dayKey,
          previousValue + Number.parseFloat(entry.revenu.toString()),
        );
      }

      return {
        rows: recentDateKeys.map((date) => ({
          label: date,
          value: (totalsByDate.get(date) ?? 0).toString(),
        })),
      };
    }),
    getSafeStat(async () => {
      const entries = await prisma.revenueEntry.findMany({
        where: {
          date: {
            gte: thirtyDayRange.start,
            lt: thirtyDayRange.end,
          },
        },
        select: {
          date: true,
          revenu: true,
        },
      });

      const totalsByDate = new Map<string, number>();

      for (const entry of entries) {
        const dayKey = entry.date.toISOString().slice(0, 10);
        const previousValue = totalsByDate.get(dayKey) ?? 0;

        totalsByDate.set(
          dayKey,
          previousValue + Number.parseFloat(entry.revenu.toString()),
        );
      }

      return {
        rows: thirtyDayDateKeys.map((date) => ({
          label: date,
          value: (totalsByDate.get(date) ?? 0).toString(),
        })),
      };
    }),
    getSafeStat(async () => {
      const entries = await prisma.revenueEntry.findMany({
        where: {
          date: {
            gte: sevenDayRange.start,
            lt: sevenDayRange.end,
          },
        },
        select: {
          server: true,
          date: true,
          revenu: true,
        },
      });

      const totalsByServerAndDate = new Map<string, number>();

      for (const entry of entries) {
        const dayKey = entry.date.toISOString().slice(0, 10);
        const aggregateKey = `${entry.server}:${dayKey}`;
        const previousValue = totalsByServerAndDate.get(aggregateKey) ?? 0;

        totalsByServerAndDate.set(
          aggregateKey,
          previousValue + Number.parseFloat(entry.revenu.toString() ?? "0"),
        );
      }

      return {
        groups: SERVER_OPTIONS.map((server) => ({
          label: server,
          rows: recentDateKeys.map((date) => ({
            label: date,
            value: (totalsByServerAndDate.get(`${server}:${date}`) ?? 0).toString(),
          })),
        })),
      };
    }),
    getSafeStat(async () => {
      const entries = await prisma.revenueEntry.findMany({
        where: {
          date: {
            gte: thirtyDayRange.start,
            lt: thirtyDayRange.end,
          },
        },
        select: {
          server: true,
          date: true,
          revenu: true,
        },
      });

      const totalsByServerAndDate = new Map<string, number>();

      for (const entry of entries) {
        const dayKey = entry.date.toISOString().slice(0, 10);
        const aggregateKey = `${entry.server}:${dayKey}`;
        const previousValue = totalsByServerAndDate.get(aggregateKey) ?? 0;

        totalsByServerAndDate.set(
          aggregateKey,
          previousValue + Number.parseFloat(entry.revenu.toString() ?? "0"),
        );
      }

      return {
        groups: SERVER_OPTIONS.map((server) => ({
          label: server,
          rows: thirtyDayDateKeys.map((date) => ({
            label: date,
            value: (totalsByServerAndDate.get(`${server}:${date}`) ?? 0).toString(),
          })),
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
      const [groupedTotals, groupedActiveDates] = await Promise.all([
        prisma.revenueEntry.groupBy({
          by: ["server"],
          _sum: { revenu: true },
        }),
        prisma.revenueEntry.groupBy({
          by: ["server", "date"],
        }),
      ]);

      const totals = createEmptyStringRecord();
      const activeDayCounts = createEmptyNumberRecord();

      for (const item of groupedTotals) {
        totals[item.server] = item._sum.revenu?.toString() ?? "0";
      }

      for (const item of groupedActiveDates) {
        activeDayCounts[item.server] += 1;
      }

      return {
        rows: SERVER_OPTIONS.map((server) => ({
          label: server,
          value: calculateAverage(totals[server], activeDayCounts[server]),
          detail: `${activeDayCounts[server]} active ${
            activeDayCounts[server] === 1 ? "day" : "days"
          }`,
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
    todayTotalPerServer,
    todayCoverage,
    bestServer,
    bestServerToday,
    bestDayEver,
    averagePerEntry,
    entriesCountPerServer,
    sevenDayTotal,
    sevenDayDailyTotalsAllServers,
    thirtyDayDailyTotalsAllServers,
    sevenDayTotalPerServer,
    sevenDayTotalBreakdown,
    thirtyDayTotalBreakdown,
    sevenDayAveragePerDay,
    allTimeAveragePerDayPerServer,
    lastEntryTimePerServer,
    highestSingleEntry,
    shareOfTotal,
  };
}
