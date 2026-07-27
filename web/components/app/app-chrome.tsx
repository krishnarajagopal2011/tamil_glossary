"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME_TA } from "@/lib/app-meta";
import { cx } from "@/lib/cx";
import { forgetAll } from "@/lib/recent";
import { AppDrawer } from "./app-drawer";
import { AppSearch } from "./app-search";
import { AppTabs } from "./app-tabs";
import { BackIcon, MenuIcon, MoreIcon } from "./icons";

/**
 * The blue chrome at the top of the phone view.
 *
 * Two shapes, as in the original app: the glossary itself gets the search bar
 * and the four tabs; the pages reached from the drawer get a back arrow and a
 * title instead, because they are not part of the tabbed flow.
 */
const DETAIL_TITLES: Record<string, string> = {
  "/about": "About",
  "/contact": "Contact Us",
};

/**
 * The drawer's items, promoted into the bar where there is room for them.
 * Deliberately the same list as the drawer: this chrome is also the packaged
 * app's, and the app has no screen behind anything else.
 */
const DESKTOP_NAV = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function AppChrome({ version }: { version: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const detailTitle = DETAIL_TITLES[pathname];

  return (
    <>
      {/* The sticky header is the containing block for the search sheet and
          the overflow menu, so both drop below the tabs rather than over
          them. Nothing inside the bar may be `relative`. */}
      <header className="app sticky top-0 z-40 bg-app-bar pt-[env(safe-area-inset-top)]">
        {detailTitle ? (
          <DetailBar title={detailTitle} />
        ) : (
          <>
            <div className="mx-auto flex h-[var(--app-bar-h)] max-w-5xl items-center gap-3 px-2 sm:px-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                className="app-touch shrink-0 text-app-bar-ink md:hidden"
              >
                <MenuIcon />
              </button>

              {/* On a wide screen the glossary says its own name; a phone
                  gives that room to the search field instead. */}
              <Link
                href="/"
                className="hidden shrink-0 leading-tight text-app-bar-ink md:block"
              >
                <span className="app-ta block text-sm font-bold">
                  {APP_NAME_TA}
                </span>
                <span className="block text-[0.6875rem] tracking-wider uppercase text-app-bar-ink-dim">
                  Social Work Glossary
                </span>
              </Link>

              <AppSearch />

              <nav className="hidden shrink-0 items-center gap-5 md:flex">
                {DESKTOP_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-app-bar-ink-dim transition-colors hover:text-app-bar-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <OverflowMenu />
            </div>

            <AppTabs />
          </>
        )}
      </header>

      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        version={version}
      />
    </>
  );
}

function DetailBar({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="mx-auto flex h-[var(--app-bar-h)] max-w-5xl items-center gap-2 px-2 sm:px-4">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="app-touch shrink-0 text-app-bar-ink"
      >
        <BackIcon />
      </button>
      <h1 className="text-xl font-medium text-app-bar-ink">{title}</h1>
    </div>
  );
}

function OverflowMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function share() {
    setOpen(false);
    const url = window.location.href;
    if (navigator.share) {
      // A cancelled share sheet rejects; that is not an error worth surfacing.
      await navigator.share({ title: document.title, url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url).catch(() => {});
    }
  }

  const item =
    "block w-full px-4 py-3 text-left text-[0.9375rem] text-app-ink active:bg-app-surface-sunk";

  return (
    <div ref={ref} className="shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More options"
        aria-expanded={open}
        className="app-touch text-app-bar-ink"
      >
        <MoreIcon />
      </button>

      {open ? (
        // The rail keeps the menu aligned with the bar's own right edge rather
        // than the viewport's, which on a wide screen are far apart.
        <div className="pointer-events-none absolute inset-x-0 top-full z-50 mx-auto flex max-w-5xl justify-end px-2 sm:px-4">
        <div
          role="menu"
          className={cx(
            "pointer-events-auto min-w-52 py-1",
            "border border-app-line bg-app-surface shadow-xl",
          )}
        >
          <button type="button" role="menuitem" onClick={share} className={item}>
            Share this page
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              forgetAll();
              setOpen(false);
              router.push("/recent");
            }}
            className={item}
          >
            Clear recent list
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              router.push("/about");
            }}
            className={item}
          >
            About this edition
          </button>
        </div>
        </div>
      ) : null}
    </div>
  );
}
