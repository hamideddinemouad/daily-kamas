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
    <nav aria-label="Primary" className="max-w-full overflow-x-auto">
      <div className="flex min-w-max items-center gap-1.5 pr-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`group inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${
              compact
                ? "min-h-8 px-2.5 py-1.5 text-xs"
                : "min-h-9 px-2.5 py-2 text-xs sm:min-h-10 sm:px-3 sm:text-sm"
            } ${
              isActive
                ? "border-stone-900 bg-stone-900 text-stone-50 shadow-[0_10px_20px_-18px_rgba(28,25,23,0.65)]"
                : "border-stone-200 bg-stone-50/80 text-stone-600 hover:border-amber-300 hover:bg-amber-50 hover:text-stone-950"
            }`}
            title={item.label}
          >
            <span
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                isActive ? "bg-amber-300" : "bg-stone-300 group-hover:bg-amber-400"
              }`}
            />
            <span>{compact ? item.shortLabel : null}</span>
            {!compact ? (
              <>
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </>
            ) : null}
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
