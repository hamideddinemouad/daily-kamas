import { logout } from "@/app/auth-actions";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={`inline-flex items-center justify-center rounded-2xl border border-stone-300 bg-white font-semibold text-stone-900 transition hover:bg-stone-100 ${
          compact
            ? "min-h-8 px-3 py-1.5 text-xs"
            : "min-h-10 px-4 py-2 text-sm"
        }`}
      >
        Logout
      </button>
    </form>
  );
}
