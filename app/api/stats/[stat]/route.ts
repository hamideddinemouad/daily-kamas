import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import {
  getSnapshotStatData,
  SNAPSHOT_STAT_KEYS,
  type SnapshotStatKey,
} from "@/lib/revenue";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/stats/[stat]">,
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stat } = await context.params;

  if (!SNAPSHOT_STAT_KEYS.includes(stat as SnapshotStatKey)) {
    return NextResponse.json({ error: "Invalid stat." }, { status: 400 });
  }

  try {
    const payload = await getSnapshotStatData(stat as SnapshotStatKey);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to load snapshot stat", error);
    return NextResponse.json(
      { error: "Unable to load the snapshot stat right now." },
      { status: 500 },
    );
  }
}
