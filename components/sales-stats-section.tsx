import { formatCreatedAt, formatRevenu } from "@/lib/formatters";
import type { SalesSummary } from "@/lib/sales";

type SalesStatsSectionProps = {
  summary: SalesSummary;
  entryCount: number;
};

function formatWholeStat(value: string) {
  return formatRevenu(Math.round(Number.parseFloat(value || "0")));
}

function formatDh(value: string) {
  return `${formatWholeStat(value)} DH`;
}

function formatMillionSuffix(value: string) {
  return `${formatWholeStat(value)}M`;
}

function formatPerMillion(value: string) {
  return `${formatRevenu(value)}/M`;
}

function SalesStatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_16px_50px_-38px_rgba(68,46,20,0.55)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-3 font-mono text-2xl font-semibold text-stone-950">
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-stone-600">{detail}</p> : null}
    </article>
  );
}

export function SalesStatsSection({
  summary,
  entryCount,
}: SalesStatsSectionProps) {
  return (
    <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-950">Sales Snapshot</h2>
        <p className="mt-1 text-sm text-stone-600">
          Quick totals and sale efficiency based on your saved sales entries.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
        <SalesStatCard
          label="Total Amount"
          value={formatDh(summary.totalAmount)}
          detail={`${entryCount} ${entryCount === 1 ? "sale" : "sales"}`}
        />
        <SalesStatCard
          label="Total Kamas Qty"
          value={formatMillionSuffix(summary.totalKamasQuantity)}
        />
        <SalesStatCard
          label="Avg Price/M"
          value={formatPerMillion(summary.averagePricePerM)}
        />
        <SalesStatCard
          label="Latest Sale"
          value={
            summary.latestSaleAt
              ? formatCreatedAt(summary.latestSaleAt)
              : "No sales yet"
          }
        />
      </div>
    </section>
  );
}
