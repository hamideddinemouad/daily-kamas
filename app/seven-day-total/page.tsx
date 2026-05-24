import { AppShell } from "@/components/app-shell";
import { PeriodTotalSection } from "@/components/snapshot-stats-section";
import { getDashboardSnapshot } from "@/lib/revenue";

export const dynamic = "force-dynamic";

export default async function SevenDayTotalPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <AppShell
      eyebrow="7-Day Total"
      title="7-Day Revenue Breakdown"
      description="Review each server day by day across the latest 7-day window, with zero-filled dates kept visible so gaps are easy to spot."
    >
      <PeriodTotalSection
        title="7-Day Total"
        description="Daily revenue totals for each server across the last 7 days. Missing days stay visible with a zero value."
        badgeLabel="7 days"
        result={snapshot.sevenDayTotalBreakdown}
      />
    </AppShell>
  );
}
