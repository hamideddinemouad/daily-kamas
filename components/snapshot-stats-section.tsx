"use client";

import { useEffect, useState } from "react";
import { formatCreatedAt, formatDate, formatRevenu } from "@/lib/formatters";
import {
  type GroupedMultiValueStat,
  type MultiValueStat,
  SNAPSHOT_STAT_KEYS,
  type SingleValueStat,
  type SnapshotStatKey,
  type SnapshotStatResponse,
  type StatResult,
} from "@/lib/revenue";

type ValueDisplay = "revenue" | "text" | "datetime";
const PAGE_SIZE = 10;

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

export function ListStatCard({
  title,
  result,
  valueDisplay,
  detailDisplay = "text",
  paginate = false,
  collapsedByDefault = false,
  revealLabel = "Show details",
  hideLabel = "Hide details",
}: {
  title: string;
  result: StatResult<MultiValueStat>;
  valueDisplay: ValueDisplay;
  detailDisplay?: ValueDisplay;
  paginate?: boolean;
  collapsedByDefault?: boolean;
  revealLabel?: string;
  hideLabel?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isExpanded, setIsExpanded] = useState(!collapsedByDefault);

  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_16px_50px_-38px_rgba(68,46,20,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          {title}
        </p>
        {collapsedByDefault ? (
          <button
            type="button"
            onClick={() => setIsExpanded((currentState) => !currentState)}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            {isExpanded ? hideLabel : revealLabel}
          </button>
        ) : null}
      </div>
      {result.ok ? (() => {
        const visibleRows = paginate
          ? result.value.rows.slice(0, visibleCount)
          : result.value.rows;
        const hasMoreRows = paginate && visibleCount < result.value.rows.length;

        return (
        isExpanded ? (
        <div className="mt-4 space-y-3">
          {visibleRows.map((row) => (
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
          {hasMoreRows ? (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3">
              <p className="text-sm text-stone-600">
                Showing {visibleRows.length} of {result.value.rows.length} rows.
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
        ) : null
        );
      })() : (
        <p className="mt-3 text-sm text-rose-700">
          Unavailable right now: {result.message}
        </p>
      )}
    </article>
  );
}

export function PeriodTotalSection({
  title,
  description,
  badgeLabel,
  result,
  paginate = false,
  collapseGroupsByDefault = false,
  revealGroupLabel = "Show details",
  hideGroupLabel = "Hide details",
}: {
  title: string;
  description: string;
  badgeLabel: string;
  result: StatResult<GroupedMultiValueStat>;
  paginate?: boolean;
  collapseGroupsByDefault?: boolean;
  revealGroupLabel?: string;
  hideGroupLabel?: string;
}) {
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  return (
    <section className="mt-6 rounded-[1.9rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_45px_-36px_rgba(68,46,20,0.45)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          Newest day first
        </p>
      </div>

      {result.ok ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {result.value.groups.map((group) => {
            const visibleCount = paginate
              ? (visibleCounts[group.label] ?? PAGE_SIZE)
              : group.rows.length;
            const visibleRows = group.rows.slice(0, visibleCount);
            const hasMoreRows = paginate && visibleCount < group.rows.length;
            const isExpanded = collapseGroupsByDefault
              ? (expandedGroups[group.label] ?? false)
              : true;

            return (
              <article
                key={group.label}
                className="rounded-[1.5rem] border border-stone-200 bg-white/95 p-4 shadow-[0_16px_36px_-30px_rgba(68,46,20,0.35)]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
                  <h4 className="text-base font-semibold capitalize text-stone-950">
                    {group.label}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                      {badgeLabel}
                    </span>
                    {collapseGroupsByDefault ? (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroups((currentGroups) => ({
                            ...currentGroups,
                            [group.label]: !isExpanded,
                          }))
                        }
                        className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        {isExpanded ? hideGroupLabel : revealGroupLabel}
                      </button>
                    ) : null}
                  </div>
                </div>

                {isExpanded ? (
                  <>
                    <div className="mt-3 space-y-2">
                      {visibleRows.map((row, index) => (
                        <div
                          key={`${group.label}-${row.label}`}
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
                          Showing {visibleRows.length} of {group.rows.length} days.
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleCounts((currentCounts) => ({
                              ...currentCounts,
                              [group.label]:
                                (currentCounts[group.label] ?? PAGE_SIZE) + PAGE_SIZE,
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
      ) : (
        <p className="mt-4 text-sm text-rose-700">
          Unavailable right now: {result.message}
        </p>
      )}
    </section>
  );
}

export function SnapshotStatsSection({
}: Record<string, never>) {
  const statConfigs: Array<{
    key: SnapshotStatKey;
    title: string;
    kind: SnapshotStatResponse["kind"];
    valueDisplay: ValueDisplay;
    detailDisplay?: ValueDisplay;
    alwaysVisible?: boolean;
  }> = [
    {
      key: "todayTotal",
      title: "Today Total",
      kind: "single",
      valueDisplay: "revenue",
      alwaysVisible: true,
    },
    {
      key: "todayTotalPerServer",
      title: "Today Total Per Server",
      kind: "list",
      valueDisplay: "revenue",
      alwaysVisible: true,
    },
    {
      key: "bestServerToday",
      title: "Best Server Today",
      kind: "single",
      valueDisplay: "text",
      detailDisplay: "revenue",
      alwaysVisible: true,
    },
    {
      key: "sevenDayTotal",
      title: "7-Day Total",
      kind: "single",
      valueDisplay: "revenue",
    },
    {
      key: "sevenDayDailyTotalsAllServers",
      title: "7-Day Daily Totals",
      kind: "list",
      valueDisplay: "revenue",
    },
    {
      key: "sevenDayTotalPerServer",
      title: "7-Day Total Per Server",
      kind: "list",
      valueDisplay: "revenue",
    },
    {
      key: "sevenDayAveragePerDay",
      title: "7-Day Average/Day",
      kind: "list",
      valueDisplay: "revenue",
    },
    {
      key: "allTimeAveragePerDay",
      title: "All-Time Average/Day",
      kind: "single",
      valueDisplay: "revenue",
    },
    {
      key: "allTimeAveragePerDayPerServer",
      title: "All-Time Average/Day Per Server",
      kind: "list",
      valueDisplay: "revenue",
      detailDisplay: "text",
    },
    {
      key: "shareOfTotal",
      title: "Share Of Total",
      kind: "list",
      valueDisplay: "text",
      detailDisplay: "revenue",
    },
    {
      key: "bestDayEver",
      title: "Best Day Ever",
      kind: "single",
      valueDisplay: "revenue",
    },
    {
      key: "bestServer",
      title: "Best Server Ever",
      kind: "single",
      valueDisplay: "text",
      detailDisplay: "revenue",
    },
    {
      key: "highestSingleEntry",
      title: "Highest Single Entry",
      kind: "single",
      valueDisplay: "revenue",
    },
  ];
  const [expandedKeys, setExpandedKeys] = useState<
    Partial<Record<SnapshotStatKey, boolean>>
  >({});
  const [loadingKeys, setLoadingKeys] = useState<
    Partial<Record<SnapshotStatKey, boolean>>
  >({});
  const [results, setResults] = useState<
    Partial<Record<SnapshotStatKey, SnapshotStatResponse>>
  >({});
  const [errors, setErrors] = useState<Partial<Record<SnapshotStatKey, string>>>(
    {},
  );

  async function loadStat(key: SnapshotStatKey, expand = true) {
    if (expand) {
      setExpandedKeys((currentState) => ({
        ...currentState,
        [key]: true,
      }));
    }
    setLoadingKeys((currentState) => ({
      ...currentState,
      [key]: true,
    }));
    setErrors((currentState) => ({
      ...currentState,
      [key]: "",
    }));
    setResults((currentState) => ({
      ...currentState,
      [key]: undefined,
    }));

    try {
      const response = await fetch(`/api/stats/${key}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as
        | SnapshotStatResponse
        | { error?: string };

      if (
        !response.ok ||
        !payload ||
        !("kind" in payload) ||
        !SNAPSHOT_STAT_KEYS.includes(key)
      ) {
        throw new Error(
          "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Unable to load this stat right now.",
        );
      }

      setResults((currentState) => ({
        ...currentState,
        [key]: payload,
      }));
    } catch (error) {
      setErrors((currentState) => ({
        ...currentState,
        [key]:
          error instanceof Error
            ? error.message
            : "Unable to load this stat right now.",
      }));
    } finally {
      setLoadingKeys((currentState) => ({
        ...currentState,
        [key]: false,
      }));
    }
  }

  async function toggleStat(key: SnapshotStatKey) {
    if (expandedKeys[key]) {
      setExpandedKeys((currentState) => ({
        ...currentState,
        [key]: false,
      }));
      return;
    }

    await loadStat(key);
  }

  useEffect(() => {
    for (const config of statConfigs) {
      if (config.alwaysVisible && !expandedKeys[config.key] && !loadingKeys[config.key]) {
        void loadStat(config.key);
      }
    }
  }, [expandedKeys, loadingKeys]);

  return (
    <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-950">Snapshot Stats</h2>
        <p className="mt-1 text-sm text-stone-600">
          Open any stat card when you want it. Each card fetches fresh data only
          when requested.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {statConfigs.map((config) => {
          const isExpanded = config.alwaysVisible
            ? true
            : (expandedKeys[config.key] ?? false);
          const isLoading = loadingKeys[config.key] ?? false;
          const payload = results[config.key];
          const loadError = errors[config.key];

          return (
            <article
              key={config.key}
              className="rounded-[1.75rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_16px_50px_-38px_rgba(68,46,20,0.55)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {config.title}
                </p>
                {!config.alwaysVisible ? (
                  <button
                    type="button"
                    onClick={() => void toggleStat(config.key)}
                    className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                  >
                    {isExpanded ? "Hide" : "Show"}
                  </button>
                ) : null}
              </div>

              {isExpanded ? (
                <div className="mt-4">
                  {isLoading ? (
                    <p className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-600">
                      Loading {config.title.toLowerCase()}...
                    </p>
                  ) : null}

                  {loadError ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {loadError}
                    </p>
                  ) : null}

                  {!isLoading && !loadError && payload?.kind === "single" ? (
                    <div>
                      {payload.result.ok ? (
                        <>
                          <p className="font-mono text-2xl font-semibold text-stone-950">
                            {formatStatValue(payload.result.value.value, config.valueDisplay)}
                          </p>
                          {payload.result.value.detail ? (
                            <p className="mt-2 text-sm text-stone-600">
                              {formatStatValue(
                                payload.result.value.detail,
                                config.detailDisplay ?? "text",
                              )}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-sm text-rose-700">
                          Unavailable right now: {payload.result.message}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {!isLoading && !loadError && payload?.kind === "list" ? (
                    <div className="space-y-3">
                      {payload.result.ok ? (
                        payload.result.value.rows.map((row) => (
                          <div
                            key={row.label}
                            className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3 last:border-b-0 last:pb-0"
                          >
                            <div>
                              <p className="text-sm font-medium text-stone-700">
                                {row.label}
                              </p>
                              {row.detail ? (
                                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                                  {formatStatValue(
                                    row.detail,
                                    config.detailDisplay ?? "text",
                                  )}
                                </p>
                              ) : null}
                            </div>
                            <p className="text-right font-mono text-sm font-semibold text-stone-950">
                              {formatStatValue(row.value, config.valueDisplay)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-rose-700">
                          Unavailable right now: {payload.result.message}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
