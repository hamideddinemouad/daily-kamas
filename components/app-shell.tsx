import { AppNav, CompactAppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";

export function AppShell({
  eyebrow,
  title,
  description,
  compactHeader = false,
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
        <section
          className={`relative overflow-hidden border border-stone-300/70 bg-white/88 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur ${
            compactHeader ? "rounded-[1.5rem] p-4 sm:p-5" : "rounded-[2rem] p-6 sm:p-8"
          }`}
        >
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-200/25 blur-3xl" />

          <div className={`relative flex flex-col ${compactHeader ? "gap-4" : "gap-5"}`}>
            <div
              className={`flex flex-col ${
                compactHeader
                  ? "gap-4 xl:flex-row xl:items-center xl:justify-between"
                  : "gap-5 lg:flex-row lg:items-start lg:justify-between"
              }`}
            >
              <div className={compactHeader ? "min-w-0" : "max-w-2xl"}>
                <p
                  className={`font-semibold uppercase text-amber-800 ${
                    compactHeader
                      ? "text-[11px] tracking-[0.18em]"
                      : "text-xs tracking-[0.22em]"
                  }`}
                >
                  {eyebrow}
                </p>
                <h1
                  className={`font-semibold tracking-tight text-stone-950 ${
                    compactHeader
                      ? "mt-1 text-lg sm:text-xl"
                      : "mt-4 text-3xl sm:text-4xl"
                  }`}
                >
                  {title}
                </h1>
                {!compactHeader ? (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                    {description}
                  </p>
                ) : null}
              </div>

              <div
                className={`flex ${
                  compactHeader
                    ? "flex-col gap-3 xl:min-w-0 xl:flex-1 xl:flex-row xl:items-center xl:justify-end"
                    : "items-center justify-start lg:justify-end"
                }`}
              >
                {compactHeader ? (
                  <div className="min-w-0 rounded-[1rem] border border-stone-200/80 bg-white/72 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_-24px_rgba(68,46,20,0.35)]">
                    <CompactAppNav />
                  </div>
                ) : null}
                <div className={compactHeader ? "xl:shrink-0" : ""}>
                  <LogoutButton compact={compactHeader} />
                </div>
              </div>
            </div>

            {!compactHeader ? (
              <div className="rounded-[1.25rem] border border-stone-200/80 bg-white/72 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_24px_-24px_rgba(68,46,20,0.35)]">
                <AppNav />
              </div>
            ) : null}
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
