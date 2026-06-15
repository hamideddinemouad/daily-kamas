import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import type { KamasSoldEntryView } from "@/lib/types";

export type SalesData = {
  entries: KamasSoldEntryView[];
  databaseConfigured: boolean;
  salesDataError: string | null;
};

function createEmptySalesData(
  databaseConfigured: boolean,
  salesDataError: string | null = null,
): SalesData {
  return {
    entries: [],
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

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        amount: entry.amount.toString(),
        kamasQuantity: entry.kamasQuantity.toString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
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
