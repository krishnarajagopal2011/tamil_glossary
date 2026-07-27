"use client";

import { useState } from "react";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { LETTERS, type LetterCount } from "@/lib/types";
import { ChevronIcon } from "./icons";

/** The circled chevron on the index header: drops down an A–Z chooser. */
export function LetterPicker({
  counts,
  active,
}: {
  counts: LetterCount[];
  active: string;
}) {
  const [open, setOpen] = useState(false);
  const byLetter = new Map(counts.map((c) => [c.initial, c.count]));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Choose a letter"
        className="app-touch -mr-2"
      >
        <span
          className={cx(
            "flex size-8 items-center justify-center rounded-full border-2",
            "border-app-ink-soft text-app-ink-soft transition-transform",
            open && "rotate-180",
          )}
        >
          <ChevronIcon className="size-4" />
        </span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-app-line bg-app-surface p-2 shadow-lg">
          <ul className="grid grid-cols-7 gap-1.5">
            {LETTERS.map((letter) => {
              const count = byLetter.get(letter) ?? 0;
              const label = letter === "#" ? "#" : letter;

              if (count === 0) {
                return (
                  <li key={letter} aria-hidden="true">
                    <span className="flex h-10 items-center justify-center rounded border border-app-line text-sm text-app-ink-faint/50">
                      {label}
                    </span>
                  </li>
                );
              }

              return (
                <li key={letter}>
                  <Link
                    href={"/browse?letter=" + encodeURIComponent(letter)}
                    onClick={() => setOpen(false)}
                    aria-current={letter === active ? "page" : undefined}
                    className={cx(
                      "flex h-10 items-center justify-center rounded border text-sm font-medium",
                      letter === active
                        ? "border-app-accent bg-app-accent text-white"
                        : "border-app-line text-app-ink active:bg-app-surface-sunk",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
}
