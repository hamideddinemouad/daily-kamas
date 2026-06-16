"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRevenueEntry } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { emptyActionState } from "@/lib/validation";
import type { ServerOption } from "@/lib/constants";

type MissingServerEntryRowProps = {
  server: ServerOption;
  hasEntryToday: boolean;
};

export function MissingServerEntryRow({
  server,
  hasEntryToday,
}: MissingServerEntryRowProps) {
  const [state, formAction] = useActionState(
    createRevenueEntry,
    emptyActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-[1.4rem] border border-stone-200 bg-stone-50/92 p-3 shadow-[0_10px_30px_-24px_rgba(68,46,20,0.45)]"
    >
      <input type="hidden" name="server" value={server} />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
            <span className="truncate capitalize">{server}</span>
            {hasEntryToday ? (
              <span
                aria-label={`${server} has an entry today`}
                title="Entry saved today"
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
              />
            ) : null}
          </div>
        </div>
        <SubmitButton idleLabel="Save" pendingLabel="Saving..." />
      </div>

      <div className="mt-3">
        <input
          name="revenu"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          aria-label={`Revenue for ${server}`}
          className="min-h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-amber-500"
        />
      </div>

      {state.error ? (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
