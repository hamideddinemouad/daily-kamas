"use client";

import { useActionState, useState } from "react";
import { deleteKamasSoldEntry, updateKamasSoldEntry } from "@/app/actions";
import { formatCreatedAt, formatRevenu } from "@/lib/formatters";
import type { KamasSoldEntryView } from "@/lib/types";
import { emptyActionState } from "@/lib/validation";
import { SubmitButton } from "@/components/submit-button";

type KamasSoldEntryRowProps = {
  entry: KamasSoldEntryView;
  onDelete?: (id: string) => void;
};

export function KamasSoldEntryRow({ entry, onDelete }: KamasSoldEntryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction] = useActionState(
    updateKamasSoldEntry,
    emptyActionState,
  );
  const [deleteState, deleteAction] = useActionState(
    async () => {
      const result = await deleteKamasSoldEntry(entry.id);

      if (result.success) {
        onDelete?.(entry.id);
      }

      return result;
    },
    emptyActionState,
  );

  if (isEditing) {
    return (
      <tr className="rounded-3xl bg-amber-50/80 align-top shadow-sm">
        <td colSpan={4} className="rounded-3xl border border-amber-200 px-4 py-4">
          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="id" value={entry.id} />
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Amount</span>
                <input
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  defaultValue={entry.amount}
                  className="min-h-11 w-full rounded-2xl border border-amber-200 bg-white px-4 outline-none transition focus:border-amber-500"
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
                  defaultValue={entry.kamasQuantity}
                  className="min-h-11 w-full rounded-2xl border border-amber-200 bg-white px-4 outline-none transition focus:border-amber-500"
                />
              </label>

              <SubmitButton idleLabel="Save" pendingLabel="Saving..." />

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
              >
                Cancel
              </button>
            </div>

            {updateState.error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {updateState.error}
              </p>
            ) : null}

            {updateState.success ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {updateState.message} You can close this form or keep adjusting the sale.
              </p>
            ) : null}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="align-top shadow-sm">
      <td className="rounded-l-3xl border-y border-l border-stone-200 bg-stone-50 px-4 py-4 font-mono text-stone-950">
        {formatRevenu(entry.amount)}
      </td>
      <td className="border-y border-stone-200 bg-stone-50 px-4 py-4 font-mono text-stone-950">
        {formatRevenu(entry.kamasQuantity)}
      </td>
      <td className="border-y border-stone-200 bg-stone-50 px-4 py-4 text-stone-700">
        {formatCreatedAt(entry.createdAt)}
      </td>
      <td className="rounded-r-3xl border-y border-r border-stone-200 bg-stone-50 px-4 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Edit sale
          </button>
          <form action={deleteAction} className="space-y-2">
            <SubmitButton
              idleLabel="Delete sale"
              pendingLabel="Deleting..."
              variant="danger"
            />
            {deleteState.error ? (
              <p className="max-w-44 text-right text-xs text-red-600">
                {deleteState.error}
              </p>
            ) : null}
          </form>
        </div>
      </td>
    </tr>
  );
}
