import { AppShell } from "@/components/app-shell";
import {
  ListStatCard,
  PeriodTotalSection,
} from "@/components/snapshot-stats-section";
import { getDashboardSnapshot } from "@/lib/revenue";

export const dynamic = "force-dynamic";

export default async function ThirtyDayTotalPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <AppShell
      eyebrow="30-Day Total"
      title="30-Day Revenue Breakdown"
      description="Review each server across the latest 30-day window, with zero-filled dates kept visible so longer gaps and trends are easy to spot."
    >
      <ListStatCard
        title="30-Day Daily Totals"
        result={snapshot.thirtyDayDailyTotalsAllServers}
        valueDisplay="revenue"
        paginate
      />
      <PeriodTotalSection
        title="30-Day Total"
        description="Daily revenue totals for each server across the last 30 days. Missing days stay visible with a zero value."
        badgeLabel="30 days"
        result={snapshot.thirtyDayTotalBreakdown}
        paginate
      />
    </AppShell>
  );
}
