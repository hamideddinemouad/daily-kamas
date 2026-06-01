"use client";

import { useActionState, useEffect, useRef } from "react";
import { createKamasSoldEntry } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { emptyActionState } from "@/lib/validation";

export function CreateSalesEntryForm() {
  const [state, formAction] = useActionState(
    createKamasSoldEntry,
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
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Amount</span>
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="min-h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">
            Kamas Quantity
          </span>
          <input
            name="kamasQuantity"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="min-h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Price Per M</span>
          <input
            name="pricePerM"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="min-h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
          />
        </label>

        <SubmitButton idleLabel="Create sale" pendingLabel="Creating..." />
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
