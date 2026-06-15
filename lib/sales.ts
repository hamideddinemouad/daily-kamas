import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import type { KamasSoldEntryView } from "@/lib/types";

export type SalesSummary = {
  totalAmount: string;
  totalKamasQuantity: string;
  averageAmountPerSale: string;
  averagePricePerM: string;
  latestSaleAt: string | null;
};

export type SalesData = {
  entries: KamasSoldEntryView[];
  summary: SalesSummary;
  databaseConfigured: boolean;
  salesDataError: string | null;
};

function createEmptySalesSummary(): SalesSummary {
  return {
    totalAmount: "0",
    totalKamasQuantity: "0",
    averageAmountPerSale: "0",
    averagePricePerM: "0",
    latestSaleAt: null,
  };
}

function calculateAverage(total: number, count: number) {
  if (!Number.isFinite(total) || count <= 0) {
    return "0";
  }

  return (total / count).toString();
}

function createEmptySalesData(
  databaseConfigured: boolean,
  salesDataError: string | null = null,
): SalesData {
  return {
    entries: [],
    summary: createEmptySalesSummary(),
    databaseConfigured,
    salesDataError,
  };
}

export async function getSalesData(): Promise<SalesData> {
  if (!isDatabaseConfigured()) {
    return createEmptySalesData(false);
  }

  try {
    const prisma = getPrismaClient();
    const entries = await prisma.kamasSoldEntry.findMany({
      orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
    });
    const totalAmount = entries.reduce(
      (sum, entry) => sum + Number.parseFloat(entry.amount.toString()),
      0,
    );
    const totalKamasQuantity = entries.reduce(
      (sum, entry) => sum + Number.parseFloat(entry.kamasQuantity.toString()),
      0,
    );
    const averagePricePerM =
      totalKamasQuantity > 0
        ? (totalAmount / totalKamasQuantity).toString()
        : "0";

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        amount: entry.amount.toString(),
        kamasQuantity: entry.kamasQuantity.toString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
      summary: {
        totalAmount: totalAmount.toString(),
        totalKamasQuantity: totalKamasQuantity.toString(),
        averageAmountPerSale: calculateAverage(totalAmount, entries.length),
        averagePricePerM,
        latestSaleAt: entries[0]?.createdAt.toISOString() ?? null,
      },
      databaseConfigured: true,
      salesDataError: null,
    };
  } catch (error) {
    return createEmptySalesData(
      true,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
