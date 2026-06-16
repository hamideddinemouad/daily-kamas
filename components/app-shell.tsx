import { CompactAppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";

export function AppShell({
  eyebrow: _eyebrow,
  title: _title,
  description: _description,
  compactHeader = true,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  compactHeader?: boolean;
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#f8f5ef_38%,#f1ebdf_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[1.5rem] border border-stone-300/70 bg-white/88 p-4 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-5">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-200/25 blur-3xl" />

          <div className="relative flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 rounded-[1rem] border border-stone-200/80 bg-white/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_-24px_rgba(68,46,20,0.35)]">
              <CompactAppNav />
            </div>
            <div className="xl:shrink-0">
              <LogoutButton compact />
            </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
