import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { getRecentRevenueEntriesPageData } from "@/lib/revenue";

export const dynamic = "force-dynamic";

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: Request) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const offset = parsePositiveInt(searchParams.get("offset"), 0);
    const limit = parsePositiveInt(searchParams.get("limit"), 10);
    const result = await getRecentRevenueEntriesPageData(limit, offset);

    if (result.entriesDataError) {
      return NextResponse.json(
        { error: "Unable to load more entries right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      entries: result.entries,
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error("Failed to load recent entries", error);
    return NextResponse.json(
      { error: "Unable to load more entries right now." },
      { status: 500 },
    );
  }
}
