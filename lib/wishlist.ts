import { Prisma } from "@prisma/client";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import { parseWishlistInput } from "@/lib/validation";

export type WishlistItemRecord = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type WishlistRow = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeWishlistRow(row: WishlistRow): WishlistItemRecord {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function getWishlistDelegate() {
  const prisma = getPrismaClient();
  const wishlistItem = (
    prisma as typeof prisma & {
      wishlistItem?: {
        findMany: (args: {
          orderBy: { createdAt: "desc" }[];
          take: number;
        }) => Promise<WishlistRow[]>;
        create: (args: {
          data: { content: string };
        }) => Promise<WishlistRow>;
        delete: (args: { where: { id: string } }) => Promise<WishlistRow>;
      };
    }
  ).wishlistItem;

  return { prisma, wishlistItem };
}

export async function listWishlistItems(): Promise<WishlistItemRecord[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const { prisma, wishlistItem } = getWishlistDelegate();

  const items = wishlistItem
    ? await wishlistItem.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: 8,
      })
    : await prisma.$queryRaw<WishlistRow[]>(Prisma.sql`
        SELECT "id", "content", "createdAt", "updatedAt"
        FROM "WishlistItem"
        ORDER BY "createdAt" DESC
        LIMIT 8
      `);

  return items.map(normalizeWishlistRow);
}

export async function createWishlistItem(content: unknown) {
  const parsed = parseWishlistInput(content);

  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      error: parsed.error,
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      ok: false as const,
      status: 503,
      error: "DATABASE_URL is missing. Add your Neon connection string in .env.",
    };
  }

  const { prisma, wishlistItem } = getWishlistDelegate();
  const item = wishlistItem
    ? await wishlistItem.create({
        data: {
          content: parsed.data.content,
        },
      })
    : (
        await prisma.$queryRaw<WishlistRow[]>(Prisma.sql`
          INSERT INTO "WishlistItem" ("id", "content", "createdAt", "updatedAt")
          VALUES (${crypto.randomUUID()}, ${parsed.data.content}, NOW(), NOW())
          RETURNING "id", "content", "createdAt", "updatedAt"
        `)
      )[0];

  return {
    ok: true as const,
    item: normalizeWishlistRow(item),
  };
}

export async function deleteWishlistItem(id: unknown) {
  if (typeof id !== "string" || id.trim() === "") {
    return {
      ok: false as const,
      status: 400,
      error: "Missing wishlist item identifier.",
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      ok: false as const,
      status: 503,
      error: "DATABASE_URL is missing. Add your Neon connection string in .env.",
    };
  }

  const { prisma, wishlistItem } = getWishlistDelegate();

  if (wishlistItem) {
    await wishlistItem.delete({
      where: { id },
    });
  } else {
    await prisma.$executeRaw(
      Prisma.sql`DELETE FROM "WishlistItem" WHERE "id" = ${id}`,
    );
  }

  return {
    ok: true as const,
  };
}
