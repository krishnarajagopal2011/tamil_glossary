import Link from "next/link";
import type { TermRef } from "@/lib/types";
import { LetterPicker } from "./letter-picker";

/**
 * The Index tab: one letter at a time, every headword under it, numbered.
 *
 * The sticky header carries the letter and the control that switches to
 * another one — the same shape as the original app's collapsible header.
 */
export function IndexList({
  letter,
  terms,
  counts,
}: {
  letter: string;
  terms: TermRef[];
  counts: { initial: string; count: number }[];
}) {
  return (
    <div className="mx-auto min-h-full max-w-5xl bg-app-surface-sunk">
      <div className="sticky top-[calc(var(--app-bar-h)+var(--app-tabs-h)+env(safe-area-inset-top))] z-20 flex items-center justify-between border-b border-app-line bg-app-surface px-4 py-2.5">
        <p className="flex items-baseline gap-3">
          <span className="text-lg font-bold text-app-accent">
            {letter === "#" ? "Other" : letter}
          </span>
          <span className="text-xs text-app-ink-faint">
            {terms.length.toLocaleString()} entries
          </span>
        </p>
        <LetterPicker counts={counts} active={letter} />
      </div>

      {terms.length === 0 ? (
        <p className="px-4 py-8 text-sm text-app-ink-soft">
          No entries start with that letter.
        </p>
      ) : (
        // Two columns once there is room: 543 entries under C is a long scroll
        // on a screen that could show twice as many at once.
        <ol className="divide-y divide-app-line/70 md:grid md:grid-cols-2 md:divide-y-0">
          {terms.map((term, i) => (
            <li key={term.slug} className="border-b border-app-line/70">
              <Link
                href={"/term/" + term.slug}
                className="flex h-full gap-3 px-4 py-3 active:bg-app-surface md:py-2.5 md:hover:bg-app-surface"
              >
                <span className="shrink-0 text-[0.9375rem] tabular-nums text-app-ink-faint">
                  {i + 1})
                </span>
                <span className="min-w-0 text-[0.9375rem] text-app-ink">
                  {term.en_word}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
