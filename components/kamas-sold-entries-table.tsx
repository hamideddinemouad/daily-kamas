import { KamasSoldEntryRow } from "@/components/kamas-sold-entry-row";
import type { KamasSoldEntryView } from "@/lib/types";

type KamasSoldEntriesTableProps = {
  entries: KamasSoldEntryView[];
};

export function KamasSoldEntriesTable({
  entries,
}: KamasSoldEntriesTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
        <p className="text-base font-medium text-stone-800">No sales yet.</p>
        <p className="mt-2 text-sm text-stone-500">
          Add your first kamas sale above to start tracking sold entries.
        </p>
      </div>
    );
  }

  return (
    <div className="data-grid overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Kamas Quantity</th>
            <th className="px-4 py-2">Price Per M</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <KamasSoldEntryRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
