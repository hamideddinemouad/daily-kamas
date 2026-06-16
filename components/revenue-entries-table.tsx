"use client";

import { useState, useTransition } from "react";
import { RevenueEntryRow } from "@/components/revenue-entry-row";
import type { RevenueEntryView } from "@/lib/types";

type RevenueEntriesTableProps = {
  initialEntries: RevenueEntryView[];
  totalCount: number;
};

const PAGE_SIZE = 10;

export function RevenueEntriesTable({
  initialEntries,
  totalCount,
}: RevenueEntriesTableProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [error, setError] = useState("");
  const [isLoadingMore, startLoadingMore] = useTransition();

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

  const hasMoreEntries = entries.length < totalCount;

  function handleShowMore() {
    startLoadingMore(async () => {
      try {
        setError("");
        const response = await fetch(
          `/api/revenue/entries?offset=${entries.length}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
          },
        );
        const payload = (await response.json()) as {
          entries?: RevenueEntryView[];
          totalCount?: number;
          error?: string;
        };

        if (!response.ok || !payload.entries) {
          throw new Error(payload.error ?? "Unable to load more entries.");
        }

        setEntries((currentEntries) => [...currentEntries, ...payload.entries!]);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load more entries.",
        );
      }
    });
  }

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
            {entries.map((entry) => (
              <RevenueEntryRow key={entry.id} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {hasMoreEntries ? (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4">
          <p className="text-sm text-stone-600">
            Showing {entries.length} of {totalCount} entries.
          </p>
          <button
            type="button"
            onClick={handleShowMore}
            disabled={isLoadingMore}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            {isLoadingMore ? "Loading..." : "Show 10 more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
