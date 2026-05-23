import { CreateEntryForm } from "@/components/create-entry-form";
import { RevenueEntriesTable } from "@/components/revenue-entries-table";
import { SERVER_OPTIONS } from "@/lib/constants";
import { formatRevenu } from "@/lib/formatters";
import { getDashboardData } from "@/lib/revenue";

export const dynamic = "force-dynamic";

export default async function Home() {
  const {
    entries,
    grandTotal,
    totalsByServer,
    averageByServer,
    activeDaysByServer,
    grandAveragePerDay,
    activeDayCount,
    databaseConfigured,
  } = await getDashboardData();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#f8f5ef_38%,#f1ebdf_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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
            </div>
            <CreateEntryForm />
            {!databaseConfigured ? (
              <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-100/80 px-5 py-4 text-sm text-amber-950">
                Add your Neon `DATABASE_URL` in `.env` to enable live data. The UI is ready, but database actions are disabled until the connection string is set.
              </div>
            ) : null}
          </section>

          <div className="flex flex-col gap-6">
            <section className="rounded-[2rem] border border-amber-200 bg-amber-50/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Grand Total
              </p>
              <p className="mt-3 font-mono text-4xl font-semibold text-amber-950">
                {formatRevenu(grandTotal)}
              </p>
              <p className="mt-3 text-sm text-amber-900">
                Avg/day: {formatRevenu(grandAveragePerDay)}
                {" · "}
                {activeDayCount} {activeDayCount === 1 ? "day" : "days"}
              </p>
            </section>

            <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-stone-950">
                Summary Totals
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Totals are grouped by your fixed server list.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVER_OPTIONS.map((server) => (
                <article
                  key={server}
                  className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {server}
                  </p>
                  <p className="mt-3 font-mono text-2xl font-semibold text-stone-950">
                    {formatRevenu(totalsByServer[server] ?? "0")}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    Avg/day: {formatRevenu(averageByServer[server] ?? "0")}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">
                    {activeDaysByServer[server] ?? 0}{" "}
                    {(activeDaysByServer[server] ?? 0) === 1 ? "active day" : "active days"}
                  </p>
                </article>
              ))}
            </div>
            </section>
          </div>
        </div>

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
