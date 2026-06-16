"use client";

import { useState } from "react";
import { formatDate, formatRevenu } from "@/lib/formatters";
import type { MultiValueStat } from "@/lib/revenue";

const PAGE_SIZE = 10;

export function ThirtyDayDailyTotalsCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<MultiValueStat["rows"] | null>(null);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  async function handleToggle() {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (rows) {
      setIsExpanded(true);
      setError("");
      return;
    }

    setIsExpanded(true);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/revenue/thirty-day/daily-totals", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as
        | MultiValueStat
        | { error?: string };

      if (!response.ok || !("rows" in payload)) {
        throw new Error(
          "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to load the 30-day daily totals right now.",
        );
      }

      setRows(payload.rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the 30-day daily totals right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const visibleRows = rows?.slice(0, visibleCount) ?? [];
  const hasMoreRows = (rows?.length ?? 0) > visibleCount;

  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_16px_50px_-38px_rgba(68,46,20,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          30-Day Daily Totals
        </p>
        <button
          type="button"
          onClick={() => void handleToggle()}
          className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
        >
          {isExpanded ? "Hide 30-day daily totals" : "Show 30-day daily totals"}
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-4">
          {isLoading ? (
            <p className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600">
              Loading 30-day daily totals...
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {!isLoading && !error && rows ? (
            <div className="space-y-3">
              {visibleRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-700">
                      {formatDate(row.label)}
                    </p>
                  </div>
                  <p className="text-right font-mono text-sm font-semibold text-stone-950">
                    {formatRevenu(row.value)}
                  </p>
                </div>
              ))}

              {hasMoreRows ? (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
                  <p className="text-sm text-stone-600">
                    Showing {visibleRows.length} of {rows.length} rows.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((currentCount) => currentCount + PAGE_SIZE)
                    }
                    className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                  >
                    Show 10 more
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
