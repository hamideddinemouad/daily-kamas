import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import { SERVER_OPTIONS, type ServerOption } from "@/lib/constants";

function calculateAverage(total: string, dayCount: number) {
  const numericTotal = Number.parseFloat(total);

  if (!Number.isFinite(numericTotal) || dayCount <= 0) {
    return "0";
  }

  return (numericTotal / dayCount).toString();
}

export async function getDashboardData() {
  if (!isDatabaseConfigured()) {
    const emptyTotals = SERVER_OPTIONS.reduce<Record<ServerOption, string>>(
      (accumulator, server) => {
        accumulator[server] = "0";
        return accumulator;
      },
      {} as Record<ServerOption, string>,
    );

    return {
      entries: [],
      totalsByServer: emptyTotals,
      averageByServer: emptyTotals,
      activeDaysByServer: SERVER_OPTIONS.reduce<Record<ServerOption, number>>(
        (accumulator, server) => {
          accumulator[server] = 0;
          return accumulator;
        },
        {} as Record<ServerOption, number>,
      ),
      grandTotal: "0",
      grandAveragePerDay: "0",
      activeDayCount: 0,
      missingServersInLast24Hours: [],
      databaseConfigured: false,
    };
  }

  const prisma = getPrismaClient();
  const [entries, groupedTotals, grandTotalAggregate] = await Promise.all([
    prisma.revenueEntry.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.revenueEntry.groupBy({
      by: ["server"],
      _sum: { revenu: true },
    }),
    prisma.revenueEntry.aggregate({
      _sum: { revenu: true },
    }),
  ]);

  const totalsByServer = SERVER_OPTIONS.reduce<Record<ServerOption, string>>(
    (accumulator, server) => {
      accumulator[server] = "0";
      return accumulator;
    },
    {} as Record<ServerOption, string>,
  );
  const activeDaysByServer = SERVER_OPTIONS.reduce<Record<ServerOption, number>>(
    (accumulator, server) => {
      accumulator[server] = 0;
      return accumulator;
    },
    {} as Record<ServerOption, number>,
  );

  for (const item of groupedTotals) {
    totalsByServer[item.server] = item._sum.revenu?.toString() ?? "0";
  }

  const allActiveDays = new Set<string>();

  for (const server of SERVER_OPTIONS) {
    const serverDays = new Set(
      entries
        .filter((entry) => entry.server === server)
        .map((entry) => entry.date.toISOString().slice(0, 10)),
    );

    activeDaysByServer[server] = serverDays.size;

    for (const day of serverDays) {
      allActiveDays.add(day);
    }
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
    grandAveragePerDay: calculateAverage(grandTotal, allActiveDays.size),
    activeDayCount: allActiveDays.size,
    missingServersInLast24Hours,
    databaseConfigured: true,
  };
}
