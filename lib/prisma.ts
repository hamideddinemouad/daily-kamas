import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function hasExpectedModelDelegates(client: PrismaClient) {
  return (
    typeof (client as PrismaClient & { revenueEntry?: unknown }).revenueEntry !==
      "undefined" &&
    typeof (client as PrismaClient & { wishlistItem?: unknown }).wishlistItem !==
      "undefined" &&
    typeof
      (client as PrismaClient & { kamasSoldEntry?: unknown }).kamasSoldEntry !==
      "undefined"
  );
}

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (globalThis.prisma) {
    if (hasExpectedModelDelegates(globalThis.prisma)) {
      return globalThis.prisma;
    }

    void globalThis.prisma.$disconnect().catch(() => {
      // Ignore disconnect errors while replacing a stale client instance.
    });
    globalThis.prisma = undefined;
  }

  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
  }

  return client;
}
