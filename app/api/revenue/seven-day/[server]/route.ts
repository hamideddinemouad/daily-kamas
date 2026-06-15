import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/api-auth";
import { SERVER_OPTIONS, type ServerOption } from "@/lib/constants";
import { getSevenDayBreakdownForServer } from "@/lib/revenue";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/revenue/seven-day/[server]">,
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { server } = await context.params;

  if (!SERVER_OPTIONS.includes(server as ServerOption)) {
    return NextResponse.json({ error: "Invalid server." }, { status: 400 });
  }

  try {
    const breakdown = await getSevenDayBreakdownForServer(server as ServerOption);
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Failed to load seven-day breakdown", error);
    return NextResponse.json(
      { error: "Unable to load the seven-day server breakdown right now." },
      { status: 500 },
    );
  }
}
