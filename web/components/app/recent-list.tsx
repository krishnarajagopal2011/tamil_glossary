"use client";

import Link from "next/link";
import { forgetAll, useRecent } from "@/lib/recent";
import { equivalents } from "@/lib/types";

/** The Recent tab: entries this reader opened, newest first. */
export function RecentList() {
  const recent = useRecent();

  if (recent.length === 0) {
    return (
      <div className="bg-app-surface px-4 py-10">
        <p className="text-[0.9375rem] text-app-ink-soft">
          Nothing opened yet.
        </p>
        <p className="mt-2 text-sm text-app-ink-faint">
          Entries you read appear here, so you can get back to them without
          searching again.
        </p>
        <Link
          href="/browse"
          className="mt-5 inline-block rounded border border-app-accent px-4 py-2.5 text-sm font-medium text-app-accent"
        >
          Open the index
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-app-surface">
      <ul className="divide-y divide-app-line/70">
        {recent.map((entry) => {
          const { primary } = equivalents(entry.ta_word);
          return (
            <li key={entry.slug}>
              <Link
                href={"/term/" + entry.slug}
                className="flex flex-col gap-0.5 px-4 py-3 active:bg-app-surface-sunk"
              >
                <span className="text-[0.9375rem] text-app-ink">
                  {entry.en_word}
                </span>
                {primary ? (
                  <span className="app-ta text-sm text-app-accent">
                    {primary}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-4 py-5">
        <button
          type="button"
          onClick={forgetAll}
          className="text-sm text-app-ink-faint underline underline-offset-4"
        >
          Clear this list
        </button>
      </div>
    </div>
  );
}
