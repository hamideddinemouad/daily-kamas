import { AppShell } from "@/components/app-shell";
import { MissingServerEntryList } from "@/components/missing-server-entry-list";
import { formatRevenu } from "@/lib/formatters";
import { getDashboardData } from "@/lib/revenue";

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const dashboardData = await getDashboardData();
  const currentMonthRange = formatCurrentMonthRange();
  const {
    grandTotal,
    grandAveragePerDay,
    activeDayCount,
    serverEntryStatusToday,
    databaseConfigured,
    dashboardDataError,
  } = dashboardData;

  return (
    <AppShell
      eyebrow="Daily Kamas"
      title="Revenue Dashboard"
      description="Track monthly performance and fill missing revenue gaps from one focused dashboard, with deeper stats and entries available in the navigation."
    >
      {dashboardDataError ? (
        <section className="rounded-[2rem] border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-900">
          Live dashboard data could not be fully loaded. Existing totals and
          entry actions are shown in a safe fallback state.
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] xl:items-start">
        <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
          <div className="mb-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-950">
                Revenue Entry Checklist
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                The date is stored automatically when the entry is created, and
                today&apos;s completed servers are marked with a green dot.
              </p>
            </div>
          </div>
          <MissingServerEntryList servers={serverEntryStatusToday} />
          {!databaseConfigured ? (
            <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-100/80 px-5 py-4 text-sm text-amber-950">
              Add your Neon `DATABASE_URL` in `.env` to enable live data. The
              UI is ready, but database actions are disabled until the connection
              string is set.
            </div>
          ) : null}
        </section>

        <aside className="relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-[linear-gradient(145deg,rgba(255,251,235,0.98)_0%,rgba(254,243,199,0.96)_52%,rgba(255,237,213,0.98)_100%)] p-6 shadow-[0_24px_80px_-40px_rgba(120,53,15,0.42)] backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-orange-200/30 blur-2xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
                Grand Total
              </p>
              <span className="rounded-full border border-amber-300/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800 shadow-sm">
                {currentMonthRange}
              </span>
            </div>

            <p className="mt-4 font-mono text-4xl font-semibold leading-none text-amber-950">
              {formatRevenu(grandTotal)}
            </p>
            <p className="mt-4 text-sm leading-6 text-amber-950/80 sm:text-base">
              Total kamas revenue collected from all servers for the full current
              month window.
            </p>

            <div className="mt-6 rounded-[1.6rem] border border-white/75 bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_40px_-30px_rgba(120,53,15,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Avg Total Per Day
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold text-stone-950">
                {formatRevenu(grandAveragePerDay)}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Based on the {activeDayCount}{" "}
                {activeDayCount === 1 ? "day" : "days"} elapsed so far this
                month, including today.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
