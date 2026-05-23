"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
};

const styles: Record<NonNullable<SubmitButtonProps["variant"]>, string> = {
  primary:
    "bg-stone-950 text-white hover:bg-stone-800 disabled:bg-stone-400",
  secondary:
    "border border-stone-300 bg-white text-stone-900 hover:bg-stone-100 disabled:text-stone-400",
  danger:
    "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300",
};

export function SubmitButton({
  idleLabel,
  pendingLabel,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
