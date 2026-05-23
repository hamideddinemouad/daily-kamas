"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRevenueEntry } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { emptyActionState } from "@/lib/validation";
import type { ServerOption } from "@/lib/constants";

type MissingServerEntryRowProps = {
  server: ServerOption;
};

export function MissingServerEntryRow({
  server,
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
      className="rounded-3xl border border-stone-200 bg-stone-50 p-4"
    >
      <input type="hidden" name="server" value={server} />
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Server</span>
          <div className="min-h-12 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-950">
            {server}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Revenu</span>
          <input
            name="revenu"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="min-h-12 w-full rounded-2xl border border-stone-300 bg-white px-4 text-stone-900 outline-none transition focus:border-amber-500"
          />
        </label>

        <SubmitButton
          idleLabel={`Save ${server}`}
          pendingLabel="Saving..."
        />
      </div>

      {state.error ? (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
