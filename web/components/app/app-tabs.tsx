"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { useRecent } from "@/lib/recent";

/**
 * The four tabs from the original edition.
 *
 * Meaning has no fixed address — it shows whichever entry was opened last, so
 * its target is resolved on the client once the recent list is readable.
 */
export function AppTabs() {
  const pathname = usePathname();
  const recent = useRecent();
  // Empty until the store is readable on the client, which is exactly what the
  // server should render: the tab points at its own empty state until then.
  const meaningHref = recent[0] ? "/term/" + recent[0].slug : "/meaning";

  const tabs = [
    { label: "Home", href: "/", active: pathname === "/" },
    {
      label: "Index",
      href: "/browse",
      active: pathname === "/browse" || pathname === "/search",
    },
    {
      label: "Meaning",
      href: meaningHref,
      active: pathname.startsWith("/term/") || pathname === "/meaning",
    },
    { label: "Recent", href: "/recent", active: pathname === "/recent" },
  ];

  return (
    <nav
      aria-label="Sections"
      className="mx-auto flex h-[var(--app-tabs-h)] max-w-5xl items-stretch bg-app-bar md:justify-start md:gap-2 md:px-4"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cx(
            "relative flex flex-1 items-center justify-center text-[0.8125rem]",
            "font-medium tracking-[0.08em] uppercase transition-colors",
            // Full-width tabs on a phone; sized to their labels on a desktop,
            // where stretching four words across 1000px reads as a mistake.
            "md:flex-none md:px-6",
            tab.active ? "text-app-bar-ink" : "text-app-bar-ink-dim",
          )}
        >
          {tab.label}
          <span
            aria-hidden="true"
            className={cx(
              "absolute inset-x-2 bottom-0 h-0.5 rounded-t-full bg-app-bar-ink",
              tab.active ? "opacity-100" : "opacity-0",
            )}
          />
        </Link>
      ))}
    </nav>
  );
}
