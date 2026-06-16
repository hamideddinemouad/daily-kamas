import { AppShell } from "@/components/app-shell";
import { ThirtyDayDailyTotalsCard } from "@/components/thirty-day-daily-totals-card";
import { ThirtyDayServerBreakdown } from "@/components/thirty-day-server-breakdown";

export const dynamic = "force-dynamic";

export default async function ThirtyDayTotalPage() {
  return (
    <AppShell
      eyebrow="30-Day Total"
      title="30-Day Revenue Breakdown"
      description="Review each server across the latest 30-day window, with zero-filled dates kept visible so longer gaps and trends are easy to spot."
    >
      <ThirtyDayDailyTotalsCard />
      <ThirtyDayServerBreakdown />
    </AppShell>
  );
}
