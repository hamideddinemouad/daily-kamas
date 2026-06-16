"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", shortLabel: "Home" },
  { href: "/stats", label: "Snapshot Stats", shortLabel: "Stats" },
  { href: "/seven-day-total", label: "7-Day Total", shortLabel: "7D Total" },
  { href: "/thirty-day-total", label: "30-Day Total", shortLabel: "30D Total" },
  { href: "/entries", label: "Recent Entries", shortLabel: "Entries" },
  { href: "/sales", label: "Sales", shortLabel: "Sales" },
  { href: "/wishlist", label: "Wishlist", shortLabel: "Wishlist" },
];

export function AppNav() {
  return <AppNavContent compact={false} />;
}

export function CompactAppNav() {
  return <AppNavContent compact />;
}

function AppNavContent({ compact }: { compact: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="data-grid max-w-full overflow-x-auto"
    >
      <div
        className={`flex min-w-max items-center pr-1 ${
          compact
            ? "gap-1 rounded-[0.95rem] bg-stone-100/90 p-1"
            : "gap-1.5 rounded-[1.15rem] bg-stone-100/85 p-1.5"
        }`}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[0.8rem] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
                compact
                  ? "min-h-9 px-3.5 py-2 text-sm tracking-[0.02em]"
                  : "min-h-10 px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:text-base"
              } ${
                isActive
                  ? "bg-white text-stone-950 shadow-[0_10px_22px_-18px_rgba(28,25,23,0.5)] ring-1 ring-stone-200"
                  : "text-stone-500 hover:bg-white/75 hover:text-stone-900"
              }`}
              title={item.label}
            >
              <span className="relative">
                <span>{compact ? item.shortLabel : item.label}</span>
                {isActive ? (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-amber-500" />
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
