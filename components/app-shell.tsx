import { AppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#f8f5ef_38%,#f1ebdf_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white/88 p-6 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-200/25 blur-3xl" />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
                  {eyebrow}
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                  {description}
                </p>
              </div>

              <div className="flex items-center justify-start lg:justify-end">
                <LogoutButton />
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-stone-200/80 bg-white/72 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_-24px_rgba(68,46,20,0.35)]">
              <AppNav />
            </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
