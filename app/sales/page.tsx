import { AppShell } from "@/components/app-shell";
import { CreateSalesEntryForm } from "@/components/create-sales-entry-form";
import { KamasSoldEntriesTable } from "@/components/kamas-sold-entries-table";
import { getSalesData } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const salesData = await getSalesData();
  const { entries, databaseConfigured, salesDataError } = salesData;

  return (
    <AppShell
      eyebrow="Sales"
      title="Kamas Sold"
      description="Create, edit, and delete kamas sold records in one place using only amount and kamas quantity."
    >
      {salesDataError ? (
        <section className="rounded-[2rem] border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-900">
          Live sales data could not be fully loaded. The page is showing a safe fallback state while the database issue is resolved.
        </section>
      ) : null}

      <div className="grid gap-6">
        <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-stone-950">
              Add Sales Entry
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Record the amount and kamas quantity for each sale.
            </p>
          </div>

          <CreateSalesEntryForm />

          {!databaseConfigured ? (
            <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-100/80 px-5 py-4 text-sm text-amber-950">
              Add your Neon `DATABASE_URL` in `.env` to enable live sales data.
              The UI is ready, but database actions are disabled until the
              connection string is set.
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-950">
                Sales Entries
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                All kamas sold entries are listed newest first, with inline edit
                and delete actions.
              </p>
            </div>
            <p className="text-sm text-stone-500">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          <KamasSoldEntriesTable entries={entries} />
        </section>
      </div>
    </AppShell>
  );
}
