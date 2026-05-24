"use server";

import { revalidatePath } from "next/cache";
import { formatCreatedAt, formatDate, formatRevenu } from "@/lib/formatters";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/prisma";
import {
  emptyActionState,
  parseEntryInput,
  type EntryActionState,
} from "@/lib/validation";

export async function createRevenueEntry(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const parsed = parseEntryInput(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  if (!isDatabaseConfigured()) {
    return {
      ...emptyActionState,
      error: "DATABASE_URL is missing. Add your Neon connection string in .env.",
    };
  }

  try {
    const prisma = getPrismaClient();
    const entry = await prisma.revenueEntry.create({
      data: {
        server: parsed.data.server,
        revenu: parsed.data.revenu,
      },
    });

    revalidatePath("/");

    return {
      ...emptyActionState,
      success: true,
      message: `${entry.server} · ${formatRevenu(entry.revenu.toString())} saved for ${formatDate(entry.date.toISOString())} at ${formatCreatedAt(entry.createdAt.toISOString())}`,
    };
  } catch (error) {
    console.error("Failed to create revenue entry", error);
    return {
      ...emptyActionState,
      error: "Unable to create the revenue entry right now.",
    };
  }
}

export async function updateRevenueEntry(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const id = formData.get("id");

  if (typeof id !== "string" || id.trim() === "") {
    return {
      ...emptyActionState,
      error: "Missing entry identifier.",
    };
  }

  const parsed = parseEntryInput(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  if (!isDatabaseConfigured()) {
    return {
      ...emptyActionState,
      error: "DATABASE_URL is missing. Add your Neon connection string in .env.",
    };
  }

  try {
    const prisma = getPrismaClient();
    await prisma.revenueEntry.update({
      where: { id },
      data: {
        server: parsed.data.server,
        revenu: parsed.data.revenu,
      },
    });
  } catch (error) {
    console.error("Failed to update revenue entry", error);
    return {
      ...emptyActionState,
      error: "Unable to update the revenue entry right now.",
    };
  }

  revalidatePath("/");

  return {
    ...emptyActionState,
    success: true,
    message: "Revenue entry updated.",
  };
}

export async function deleteRevenueEntry(
  id: string,
): Promise<EntryActionState> {
  if (!id.trim()) {
    return {
      ...emptyActionState,
      error: "Missing entry identifier.",
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      ...emptyActionState,
      error: "DATABASE_URL is missing. Add your Neon connection string in .env.",
    };
  }

  try {
    const prisma = getPrismaClient();
    await prisma.revenueEntry.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete revenue entry", error);
    return {
      ...emptyActionState,
      error: "Unable to delete the revenue entry right now.",
    };
  }

  revalidatePath("/");

  return {
    ...emptyActionState,
    success: true,
    message: "Revenue entry deleted.",
  };
}
