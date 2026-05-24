import { AppShell } from "@/components/app-shell";
import { WishlistCard } from "@/components/wishlist-card";
import { getDashboardData } from "@/lib/revenue";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const dashboardData = await getDashboardData();
  const { databaseConfigured, dashboardDataError } = dashboardData;

  return (
    <AppShell
      eyebrow="Wishlist"
      title="Feature Wishlist"
      description="Keep future ideas in one calm place so promising improvements do not get lost while you focus on daily revenue tracking."
    >
      {dashboardDataError ? (
        <section className="rounded-[2rem] border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-900">
          Wishlist data could not be fully loaded. The page is showing a safe
          fallback state while the database issue is resolved.
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-stone-950">Wishlist</h2>
          <p className="mt-1 text-sm text-stone-600">
            Save small product ideas, cleanup notes, and future experiments in a
            dedicated spot.
          </p>
        </div>

        <WishlistCard
          databaseConfigured={databaseConfigured}
          defaultListVisible
        />
      </section>
    </AppShell>
  );
}
