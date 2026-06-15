"use client";

import { useState } from "react";
import { KamasSoldEntryRow } from "@/components/kamas-sold-entry-row";
import type { KamasSoldEntryView } from "@/lib/types";

type KamasSoldEntriesTableProps = {
  entries: KamasSoldEntryView[];
};

const PAGE_SIZE = 10;

export function KamasSoldEntriesTable({
  entries,
}: KamasSoldEntriesTableProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  const visibleEntries = entries.slice(0, visibleCount);
  const hasMoreEntries = visibleCount < entries.length;

  return (
    <div className="space-y-5">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setIsVisible((currentState) => !currentState)}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
        >
          {isVisible ? "Hide sales entries" : "Show sales entries"}
        </button>
      </div>

      {isVisible ? (
        <>
          <div className="data-grid overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Kamas Quantity</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <KamasSoldEntryRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreEntries ? (
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4">
              <p className="text-sm text-stone-600">
                Showing {visibleEntries.length} of {entries.length} sales.
              </p>
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((currentCount) => currentCount + PAGE_SIZE)
                }
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
              >
                Show 10 more
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
