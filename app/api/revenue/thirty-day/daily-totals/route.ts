import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { getThirtyDayDailyTotalsAllServersStat } from "@/lib/revenue";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getThirtyDayDailyTotalsAllServersStat();

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("Failed to load thirty-day daily totals", error);
    return NextResponse.json(
      { error: "Unable to load the 30-day daily totals right now." },
      { status: 500 },
    );
  }
}
