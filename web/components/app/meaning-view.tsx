import Link from "next/link";
import { cx } from "@/lib/cx";
import { equivalents, type TermRef, type TermWithCategories } from "@/lib/types";
import { RememberEntry } from "./remember-entry";
import { ShareRow } from "./share-row";

/**
 * The Meaning tab: one entry, set the way the original app set it.
 *
 * A yellow band carries the numbered headword and the Tamil equivalents, then
 * the English explanation, then the Tamil one. The order matters — a reader
 * arriving from the index wants the equivalent first and the prose second.
 */
export function MeaningView({
  term,
  position,
  prev,
  next,
}: {
  term: TermWithCategories;
  position: number;
  prev: TermRef | null;
  next: TermRef | null;
}) {
  const { primary, alternates } = equivalents(term.ta_word);
  const tamil = [primary, ...alternates].filter(Boolean).join(", ");

  return (
    <article className="mx-auto max-w-5xl bg-app-surface pb-28 md:pb-8">
      <RememberEntry
        slug={term.slug}
        en_word={term.en_word}
        ta_word={term.ta_word}
      />

      <header className="bg-app-band px-4 py-3 sm:px-6 md:py-5">
        <h1 className="text-[1.0625rem] leading-snug font-bold text-app-band-ink md:text-2xl">
          {position}) {term.en_word}
        </h1>
        {tamil ? (
          <p className="app-ta mt-1 text-[1.0625rem] font-bold text-app-band-accent md:mt-2 md:text-xl">
            {tamil}
          </p>
        ) : null}
      </header>

      {/* One column on a phone, the way the app set it. On a wide screen the
          two explanations sit side by side instead of the English scrolling
          past before the Tamil begins. */}
      <div className="app-read grid md:grid-cols-2">
        <section className="px-4 py-4 sm:px-6 md:border-r md:border-app-line">
          <p className="mb-2 hidden text-[0.6875rem] tracking-wider uppercase text-app-ink-faint md:block">
            In English
          </p>
          {term.en_exp ? (
            <p className="leading-relaxed whitespace-pre-line text-app-ink">
              {term.en_exp}
            </p>
          ) : (
            <p className="text-sm text-app-ink-faint">
              No English explanation was recorded for this entry.
            </p>
          )}
        </section>

        <section className="px-4 pb-4 sm:px-6 md:py-4">
          <p className="mb-2 hidden text-[0.6875rem] tracking-wider uppercase text-app-ink-faint md:block">
            தமிழ் விளக்கம்
          </p>
          {term.ta_exp ? (
            <p className="app-ta whitespace-pre-line text-app-ink-soft">
              {term.ta_exp}
            </p>
          ) : (
            <p className="text-sm text-app-ink-faint">
              This entry has no Tamil explanation in the recovered edition.
            </p>
          )}
        </section>
      </div>

      <div className="px-4 pb-4 sm:px-6">
        {term.missing_figures > 0 ? (
          <p className="mt-5 border-l-2 border-app-line pl-3 text-xs text-app-ink-faint">
            The original edition carried {term.missing_figures}{" "}
            {term.missing_figures === 1 ? "figure" : "figures"} here. The image
            files were served from the old website and did not survive.
          </p>
        ) : null}

        {term.categories.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {term.categories.map((category) => (
              <li key={category.slug}>
                <span className="inline-block rounded-full border border-app-line px-2.5 py-1 text-xs text-app-ink-soft">
                  {category.name}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ShareRow term={term} />

      <nav className="grid grid-cols-2 gap-px border-t border-app-line bg-app-line">
        <Step term={prev} direction="prev" />
        <Step term={next} direction="next" />
      </nav>
    </article>
  );
}

function Step({
  term,
  direction,
}: {
  term: TermRef | null;
  direction: "prev" | "next";
}) {
  const isNext = direction === "next";

  if (!term) {
    return <span className="bg-app-surface px-4 py-3.5" />;
  }

  return (
    <Link
      href={"/term/" + term.slug}
      rel={isNext ? "next" : "prev"}
      className={cx(
        "flex flex-col gap-0.5 bg-app-surface px-4 py-3.5 active:bg-app-surface-sunk",
        isNext && "items-end text-right",
      )}
    >
      <span className="text-[0.6875rem] tracking-wider uppercase text-app-ink-faint">
        {isNext ? "Next" : "Previous"}
      </span>
      <span className="line-clamp-1 text-sm text-app-accent">
        {term.en_word}
      </span>
    </Link>
  );
}
