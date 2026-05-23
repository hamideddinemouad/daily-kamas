import { CreateEntryForm } from "@/components/create-entry-form";
import { MissingServerEntryList } from "@/components/missing-server-entry-list";
import { LogoutButton } from "@/components/logout-button";
import { RevenueEntriesTable } from "@/components/revenue-entries-table";
import { formatCreatedAt, formatRevenu } from "@/lib/formatters";
import {
  getDashboardData,
  getDashboardSnapshot,
  type MultiValueStat,
  type SingleValueStat,
  type StatResult,
} from "@/lib/revenue";

export const dynamic = "force-dynamic";

type ValueDisplay = "revenue" | "text" | "datetime";

function formatCurrentMonthRange() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(firstDay);

  return `${monthLabel} · 01-${lastDay.getUTCDate().toString().padStart(2, "0")}`;
}

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

function ListStatCard({
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

export default async function Home() {
  const [dashboardData, snapshot] = await Promise.all([
    getDashboardData(),
    getDashboardSnapshot(),
  ]);
  const currentMonthRange = formatCurrentMonthRange();
  const {
    entries,
    grandTotal,
    grandAveragePerDay,
    activeDayCount,
    missingServersInLast24Hours,
    databaseConfigured,
    dashboardDataError,
  } = dashboardData;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#f8f5ef_38%,#f1ebdf_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {dashboardDataError ? (
          <section className="rounded-[2rem] border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-900">
            Live dashboard data could not be fully loaded. Existing totals and entries are shown in a safe fallback state while isolated stat cards keep trying independently.
          </section>
        ) : null}

        <section className="relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.98)_0%,rgba(254,243,199,0.96)_52%,rgba(255,237,213,0.98)_100%)] p-6 shadow-[0_28px_90px_-42px_rgba(120,53,15,0.42)] backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-300/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-orange-200/35 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
                  Grand Total
                </p>
                <span className="rounded-full border border-amber-300/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800 shadow-sm">
                  {currentMonthRange}
                </span>
              </div>

              <p className="mt-4 font-mono text-4xl font-semibold leading-none text-amber-950 sm:text-5xl">
                {formatRevenu(grandTotal)}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-amber-950/80 sm:text-base">
                Total kamas revenue collected from all servers for the full current month window.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-[1.6rem] border border-white/70 bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_40px_-30px_rgba(120,53,15,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Avg Total Per Day
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold text-stone-950">
                {formatRevenu(grandAveragePerDay)}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Calculated across all {activeDayCount}{" "}
                {activeDayCount === 1 ? "day" : "days"} in this month, including shorter months like February.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-stone-950">
                  Add Revenue Entry
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  The date is stored automatically when the entry is created.
                </p>
              </div>
              <LogoutButton />
            </div>
            {missingServersInLast24Hours.length > 0 ? (
              <MissingServerEntryList servers={missingServersInLast24Hours} />
            ) : (
              <CreateEntryForm />
            )}
            {!databaseConfigured ? (
              <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-100/80 px-5 py-4 text-sm text-amber-950">
                Add your Neon `DATABASE_URL` in `.env` to enable live data. The UI is ready, but database actions are disabled until the connection string is set.
              </div>
            ) : null}
          </section>
        </div>

        <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-stone-950">
              Snapshot Stats
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Each stat is loaded separately so one failing query does not take down the rest.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <SingleStatCard
              title="Today Total"
              result={snapshot.todayTotal}
              valueDisplay="revenue"
            />
            <SingleStatCard
              title="Best Server"
              result={snapshot.bestServer}
              valueDisplay="text"
              detailDisplay="revenue"
            />
            <SingleStatCard
              title="Best Server Today"
              result={snapshot.bestServerToday}
              valueDisplay="text"
              detailDisplay="revenue"
            />
            <SingleStatCard
              title="Highest Single Entry"
              result={snapshot.highestSingleEntry}
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
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-950">
                Recent Entries
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                All entries are listed newest first, with inline edit and delete actions.
              </p>
            </div>
            <p className="text-sm text-stone-500">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <RevenueEntriesTable entries={entries} />
        </section>
      </div>
    </main>
  );
}
