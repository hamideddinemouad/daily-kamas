"use client";

import { useState } from "react";
import { RevenueEntryRow } from "@/components/revenue-entry-row";
import type { RevenueEntryView } from "@/lib/types";

type RevenueEntriesTableProps = {
  entries: RevenueEntryView[];
};

const PAGE_SIZE = 10;

export function RevenueEntriesTable({ entries }: RevenueEntriesTableProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
        <p className="text-base font-medium text-stone-800">No entries yet.</p>
        <p className="mt-2 text-sm text-stone-500">
          Add your first revenue entry above to start tracking totals.
        </p>
      </div>
    );
  }

  const visibleEntries = entries.slice(0, visibleCount);
  const hasMoreEntries = visibleCount < entries.length;

  return (
    <div className="space-y-5">
      <div className="data-grid overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <th className="px-4 py-2">Server</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Revenu</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleEntries.map((entry) => (
              <RevenueEntryRow key={entry.id} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>

      {hasMoreEntries ? (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4">
          <p className="text-sm text-stone-600">
            Showing {visibleEntries.length} of {entries.length} entries.
          </p>
          <button
            type="button"
            onClick={() => setVisibleCount((currentCount) => currentCount + PAGE_SIZE)}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Show 10 more
          </button>
        </div>
      ) : null}
    </div>
  );
}
