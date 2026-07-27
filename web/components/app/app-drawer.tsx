"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { HomeIcon, InfoIcon, MailIcon } from "./icons";

const items = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/about", label: "About", Icon: InfoIcon },
  { href: "/contact", label: "Contact Us", Icon: MailIcon },
];

export function AppDrawer({
  open,
  onClose,
  version,
}: {
  open: boolean;
  onClose: () => void;
  version: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={cx(
        "app fixed inset-0 z-50 md:hidden",
        open ? "" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cx(
          "absolute inset-0 bg-black/45 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <nav
        aria-label="Main menu"
        className={cx(
          "absolute inset-y-0 left-0 flex w-[17.5rem] max-w-[82%] flex-col",
          "bg-app-surface shadow-2xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="bg-app-bar px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 text-app-bar-ink">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full border-2 border-app-bar-ink/70 text-lg font-semibold"
          >
            அ/A
          </span>
          <p className="mt-3 text-[0.9375rem] font-medium">
            Social Work Glossary — {version}
          </p>
          <p className="mt-0.5 text-xs text-app-bar-ink-dim">glossary.org.in</p>
        </div>

        <ul className="flex-1 py-2">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-6 px-4 py-3.5 text-[0.9375rem]",
                    active
                      ? "bg-app-surface-sunk font-medium text-app-ink"
                      : "text-app-ink-soft active:bg-app-surface-sunk",
                  )}
                >
                  <Icon className="size-6 shrink-0 text-app-ink-faint" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-app-line px-4 py-3 text-xs text-app-ink-faint">
          Content © S. Rengasamy
        </p>
      </nav>
    </div>
  );
}
