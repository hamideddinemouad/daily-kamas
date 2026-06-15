import { AppShell } from "@/components/app-shell";
import { SevenDayServerBreakdown } from "@/components/seven-day-server-breakdown";

export const dynamic = "force-dynamic";

export default function SevenDayTotalPage() {
  return (
    <AppShell
      eyebrow="7-Day Total"
      title="7-Day Revenue Breakdown"
      description="Open each server only when you want it, so the page avoids loading every 7-day server breakdown up front."
    >
      <SevenDayServerBreakdown />
    </AppShell>
  );
}
