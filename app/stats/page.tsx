import { AppShell } from "@/components/app-shell";
import { SnapshotStatsSection } from "@/components/snapshot-stats-section";
import { getDashboardSnapshot } from "@/lib/revenue";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <AppShell
      eyebrow="Stats"
      title="Snapshot Stats"
      description="See point-in-time revenue summaries and server comparisons at a glance, with the detailed 7-day and 30-day breakdowns available in their own pages."
    >
      <SnapshotStatsSection snapshot={snapshot} />
    </AppShell>
  );
}
