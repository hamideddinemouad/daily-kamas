import { formatCreatedAt, formatDate, formatRevenu } from "@/lib/formatters";
import {
  type DashboardSnapshot,
  type GroupedMultiValueStat,
  type MultiValueStat,
  type SingleValueStat,
  type StatResult,
} from "@/lib/revenue";

type ValueDisplay = "revenue" | "text" | "datetime";

function formatStatValue(value: string, display: ValueDisplay) {
  if (display === "revenue") {
    return formatRevenu(value);
  }

  if (display === "datetime") {
    return value === "No entries yet" ? value : formatCreatedAt(value);
  }

  return value;
}

function SingleStatCard({
  title,
  result,
  valueDisplay,
  detailDisplay = "text",
}: {
  title: string;
  result: StatResult<SingleValueStat>;
  valueDisplay: ValueDisplay;
  detailDisplay?: ValueDisplay;
}) {
  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_16px_50px_-38px_rgba(68,46,20,0.55)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {title}
      </p>
      {result.ok ? (
        <>
          <p className="mt-3 font-mono text-2xl font-semibold text-stone-950">
            {formatStatValue(result.value.value, valueDisplay)}
          </p>
          {result.value.detail ? (
            <p className="mt-2 text-sm text-stone-600">
              {formatStatValue(result.value.detail, detailDisplay)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-rose-700">
          Unavailable right now: {result.message}
        </p>
      )}
    </article>
  );
}

export function ListStatCard({
  title,
  result,
  valueDisplay,
  detailDisplay = "text",
}: {
  title: string;
  result: StatResult<MultiValueStat>;
  valueDisplay: ValueDisplay;
  detailDisplay?: ValueDisplay;
}) {
  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_16px_50px_-38px_rgba(68,46,20,0.55)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {title}
      </p>
      {result.ok ? (
        <div className="mt-4 space-y-3">
          {result.value.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3 last:border-b-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-stone-700">{row.label}</p>
                {row.detail ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                    {formatStatValue(row.detail, detailDisplay)}
                  </p>
                ) : null}
              </div>
              <p className="text-right font-mono text-sm font-semibold text-stone-950">
                {formatStatValue(row.value, valueDisplay)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-rose-700">
          Unavailable right now: {result.message}
        </p>
      )}
    </article>
  );
}

export function PeriodTotalSection({
  title,
  description,
  badgeLabel,
  result,
}: {
  title: string;
  description: string;
  badgeLabel: string;
  result: StatResult<GroupedMultiValueStat>;
}) {
  return (
    <section className="mt-6 rounded-[1.9rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_45px_-36px_rgba(68,46,20,0.45)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Newest day first
        </p>
      </div>

      {result.ok ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {result.value.groups.map((group) => (
            <article
              key={group.label}
              className="rounded-[1.5rem] border border-stone-200 bg-white/95 p-4 shadow-[0_16px_36px_-30px_rgba(68,46,20,0.35)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <h4 className="text-base font-semibold capitalize text-stone-950">
                  {group.label}
                </h4>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                  {badgeLabel}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {group.rows.map((row, index) => (
                  <div
                    key={`${group.label}-${row.label}`}
                    className={`flex items-center justify-between gap-4 rounded-2xl px-3 py-2 transition-colors duration-200 ${
                      index === 0
                        ? "bg-amber-50/90"
                        : "bg-stone-50/75 hover:bg-stone-100/90"
                    }`}
                  >
                    <p className="font-mono text-sm text-stone-700">
                      {formatDate(row.label)}
                    </p>
                    <p className="font-mono text-sm font-semibold text-stone-950">
                      {formatRevenu(row.value)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-rose-700">
          Unavailable right now: {result.message}
        </p>
      )}
    </section>
  );
}

export function SnapshotStatsSection({
  snapshot,
}: {
  snapshot: DashboardSnapshot;
}) {
  return (
    <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-950">Snapshot Stats</h2>
        <p className="mt-1 text-sm text-stone-600">
          Each stat is loaded separately so one failing query does not take down
          the rest.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <SingleStatCard
          title="Today Total"
          result={snapshot.todayTotal}
          valueDisplay="revenue"
        />
        <ListStatCard
          title="Today Total Per Server"
          result={snapshot.todayTotalPerServer}
          valueDisplay="revenue"
        />
        <SingleStatCard
          title="Best Server Today"
          result={snapshot.bestServerToday}
          valueDisplay="text"
          detailDisplay="revenue"
        />
        <SingleStatCard
          title="7-Day Total"
          result={snapshot.sevenDayTotal}
          valueDisplay="revenue"
        />
        <ListStatCard
          title="7-Day Daily Totals"
          result={snapshot.sevenDayDailyTotalsAllServers}
          valueDisplay="revenue"
        />
        <ListStatCard
          title="7-Day Total Per Server"
          result={snapshot.sevenDayTotalPerServer}
          valueDisplay="revenue"
        />
        <ListStatCard
          title="7-Day Average/Day"
          result={snapshot.sevenDayAveragePerDay}
          valueDisplay="revenue"
        />
        <ListStatCard
          title="Share Of Total"
          result={snapshot.shareOfTotal}
          valueDisplay="text"
          detailDisplay="revenue"
        />
        <SingleStatCard
          title="Best Day Ever"
          result={snapshot.bestDayEver}
          valueDisplay="revenue"
        />
        <SingleStatCard
          title="Best Server Ever"
          result={snapshot.bestServer}
          valueDisplay="text"
          detailDisplay="revenue"
        />
        <SingleStatCard
          title="Highest Single Entry"
          result={snapshot.highestSingleEntry}
          valueDisplay="revenue"
        />
      </div>
    </section>
  );
}
