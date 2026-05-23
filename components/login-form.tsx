"use client";

import { useActionState } from "react";
import { login } from "@/app/auth-actions";
import { SubmitButton } from "@/components/submit-button";

const initialState = {
  error: "",
};

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-700">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="min-h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-700">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter password"
          className="min-h-12 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton idleLabel="Log in" pendingLabel="Signing in..." />
    </form>
  );
}
