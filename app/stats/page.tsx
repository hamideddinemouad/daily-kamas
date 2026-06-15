import { AppShell } from "@/components/app-shell";
import { SnapshotStatsSection } from "@/components/snapshot-stats-section";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  return (
    <AppShell
      eyebrow="Stats"
      title="Snapshot Stats"
      description="See point-in-time revenue summaries and server comparisons at a glance, with the detailed 7-day and 30-day breakdowns available in their own pages."
    >
      <SnapshotStatsSection />
    </AppShell>
  );
}
