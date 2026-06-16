"use client";

import { useState } from "react";
import { SERVER_OPTIONS, type ServerOption } from "@/lib/constants";
import { formatDate, formatRevenu } from "@/lib/formatters";
import type { ServerBreakdownRows } from "@/lib/revenue";

type LoadState = {
  expanded: boolean;
  loading: boolean;
  rows: ServerBreakdownRows["rows"] | null;
  error: string;
};

const PAGE_SIZE = 10;

function createInitialState(): Record<ServerOption, LoadState> {
  return SERVER_OPTIONS.reduce<Record<ServerOption, LoadState>>(
    (accumulator, server) => {
      accumulator[server] = {
        expanded: false,
        loading: false,
        rows: null,
        error: "",
      };
      return accumulator;
    },
    {} as Record<ServerOption, LoadState>,
  );
}

function createInitialVisibleCounts() {
  return SERVER_OPTIONS.reduce<Record<ServerOption, number>>(
    (accumulator, server) => {
      accumulator[server] = PAGE_SIZE;
      return accumulator;
    },
    {} as Record<ServerOption, number>,
  );
}

export function ThirtyDayServerBreakdown() {
  const [serverStates, setServerStates] = useState(createInitialState);
  const [visibleCounts, setVisibleCounts] = useState(createInitialVisibleCounts);

  async function handleToggle(server: ServerOption) {
    const currentState = serverStates[server];

    if (currentState.expanded) {
      setServerStates((currentStates) => ({
        ...currentStates,
        [server]: {
          ...currentStates[server],
          expanded: false,
        },
      }));
      return;
    }

    if (currentState.rows) {
      setServerStates((currentStates) => ({
        ...currentStates,
        [server]: {
          ...currentStates[server],
          expanded: true,
          error: "",
        },
      }));
      return;
    }

    setServerStates((currentStates) => ({
      ...currentStates,
      [server]: {
        expanded: true,
        loading: true,
        rows: null,
        error: "",
      },
    }));

    try {
      const response = await fetch(`/api/revenue/thirty-day/${server}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as
        | ServerBreakdownRows
        | { error?: string };

      if (!response.ok || !("rows" in payload)) {
        throw new Error(
          "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to load this server right now.",
        );
      }

      setServerStates((currentStates) => ({
        ...currentStates,
        [server]: {
          expanded: true,
          loading: false,
          rows: payload.rows,
          error: "",
        },
      }));
    } catch (error) {
      setServerStates((currentStates) => ({
        ...currentStates,
        [server]: {
          ...currentStates[server],
          loading: false,
          rows: null,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load this server right now.",
        },
      }));
    }
  }

  return (
    <section className="mt-6 rounded-[1.9rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_45px_-36px_rgba(68,46,20,0.45)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-stone-950">30-Day Total</h3>
          <p className="mt-1 text-sm text-stone-600">
            Open each server only when you want to inspect it. Each server
            fetches its own 30-day breakdown when requested.
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Newest day first
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {SERVER_OPTIONS.map((server) => {
          const serverState = serverStates[server];
          const visibleCount = visibleCounts[server];
          const visibleRows = serverState.rows?.slice(0, visibleCount) ?? [];
          const hasMoreRows =
            (serverState.rows?.length ?? 0) > visibleCount;

          return (
            <article
              key={server}
              className="rounded-[1.5rem] border border-stone-200 bg-white/95 p-4 shadow-[0_16px_36px_-30px_rgba(68,46,20,0.35)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
                <h4 className="text-base font-semibold capitalize text-stone-950">
                  {server}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                    30 days
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleToggle(server)}
                    className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                  >
                    {serverState.expanded ? "Hide server" : "Show server"}
                  </button>
                </div>
              </div>

              {serverState.expanded ? (
                <>
                  <div className="mt-3 space-y-2">
                    {serverState.loading ? (
                      <p className="rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-600">
                        Loading {server}...
                      </p>
                    ) : null}

                    {serverState.error ? (
                      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {serverState.error}
                      </p>
                    ) : null}

                    {visibleRows.map((row, index) => (
                      <div
                        key={`${server}-${row.label}`}
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

                  {hasMoreRows ? (
                    <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3">
                      <p className="text-sm text-stone-600">
                        Showing {visibleRows.length} of {serverState.rows?.length} days.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCounts((currentCounts) => ({
                            ...currentCounts,
                            [server]: currentCounts[server] + PAGE_SIZE,
                          }))
                        }
                        className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        Show 10 more
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
