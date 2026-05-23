"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRevenueEntry } from "@/app/actions";
import { SERVER_OPTIONS } from "@/lib/constants";
import { emptyActionState } from "@/lib/validation";
import { SubmitButton } from "@/components/submit-button";

export function CreateEntryForm() {
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
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Server</span>
          <select
            name="server"
            defaultValue=""
            className="min-h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          >
            <option value="" disabled>
              Select a server
            </option>
            {SERVER_OPTIONS.map((server) => (
              <option key={server} value={server}>
                {server}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Revenu</span>
          <input
            name="revenu"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="min-h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <SubmitButton idleLabel="Create entry" pendingLabel="Creating..." />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
