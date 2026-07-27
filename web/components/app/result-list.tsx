import Link from "next/link";
import { equivalents, type Term } from "@/lib/types";

/** Search results in the phone view: headword, equivalent, a line of context. */
export function ResultList({
  terms,
  query,
  total,
  caption,
}: {
  terms: Term[];
  /** Empty means "nothing typed yet", which gets its own prompt. */
  query: string;
  total: number;
  /** Replaces the "N entries for …" line where the list is not a search. */
  caption?: string;
}) {
  if (!query) {
    return (
      <div className="min-h-full bg-app-surface px-4 py-10">
        <p className="text-[0.9375rem] text-app-ink-soft">
          Type an English term or a Tamil word in the bar above.
        </p>
        <p className="mt-2 text-sm text-app-ink-faint">
          Both the headwords and the explanations are searched.
        </p>
      </div>
    );
  }

  if (terms.length === 0) {
    return (
      <div className="min-h-full bg-app-surface px-4 py-10">
        <p className="text-[0.9375rem] text-app-ink-soft">
          Nothing matches “{query}”.
        </p>
        <p className="mt-2 text-sm text-app-ink-faint">
          Try a shorter word, or drop the suffix — Tamil forms often carry one.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-app-surface">
      <p className="border-b border-app-line px-4 py-2.5 text-xs text-app-ink-faint">
        {caption ??
          total.toLocaleString() +
            (total === 1 ? " entry for “" : " entries for “") +
            query +
            "”"}
      </p>

      <ul className="divide-y divide-app-line/70">
        {terms.map((term) => {
          const { primary } = equivalents(term.ta_word);
          const context = term.ta_exp ?? term.en_exp;
          return (
            <li key={term.slug}>
              <Link
                href={"/term/" + term.slug}
                className="flex flex-col gap-0.5 px-4 py-3 active:bg-app-surface-sunk"
              >
                <span className="text-[0.9375rem] font-medium text-app-ink">
                  {term.en_word}
                </span>
                {primary ? (
                  <span className="app-ta text-sm text-app-accent">
                    {primary}
                  </span>
                ) : null}
                {context ? (
                  <span className="line-clamp-2 text-xs leading-relaxed text-app-ink-faint">
                    {context}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
