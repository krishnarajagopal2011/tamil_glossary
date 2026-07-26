import Link from "next/link";
import type { Term } from "@/lib/queries";
import { Highlight } from "./highlight";

/** Softens the cut where a clamped explanation ends. */
function Fade() {
  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-0 block h-20 bg-linear-to-b from-transparent to-paper-raised" />
  );
}

function snippet(text: string | null, length = 190) {
  if (!text) return null;
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

/**
 * Entries often carry several Tamil renderings of one English term.
 * The first is treated as the headword; the rest are listed after it.
 */
function equivalents(taWord: string | null) {
  const parts = (taWord ?? "")
    .split(/[,،;/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { primary: parts[0] ?? null, alternates: parts.slice(1) };
}

/**
 * Compact entry, used in every list on the site.
 * Tamil sits above English: the reader came here for the Tamil.
 */
export function EntryRow({ term, query }: { term: Term; query?: string }) {
  const { primary, alternates } = equivalents(term.ta_word);

  return (
    <li className="group">
      <Link
        href={`/term/${term.slug}`}
        className="block border-l-2 border-rule py-4 pl-5 transition-colors group-hover:border-violet focus-visible:border-violet"
      >
        <p className="label text-ink-faint transition-colors group-hover:text-violet">
          <Highlight text={term.en_word} query={query} />
        </p>

        {primary ? (
          <p className="ta mt-1 text-xl leading-snug font-medium text-ink sm:text-2xl">
            <Highlight text={primary} query={query} />
          </p>
        ) : null}

        {alternates.length > 0 ? (
          <p className="ta mt-1 truncate text-sm text-ink-faint">
            <Highlight text={alternates.join(" · ")} query={query} />
          </p>
        ) : null}

        {term.ta_exp || term.en_exp ? (
          <p
            className={`mt-2 max-w-[62ch] text-sm text-ink-soft ${term.ta_exp ? "ta" : ""}`}
          >
            <Highlight
              text={snippet(term.ta_exp ?? term.en_exp)}
              query={query}
            />
          </p>
        ) : null}
      </Link>
    </li>
  );
}

/**
 * The full entry — the page's signature device.
 * A mono index line, the Tamil headword at display size, then the two
 * explanations either side of a gutter rule, the way a printed bilingual
 * dictionary sets a spread.
 */
export function EntryPanel({
  term,
  categories,
  index,
  clamp = false,
  headingLevel = 1,
}: {
  term: Term;
  categories?: { slug: string; name: string; name_ta: string | null }[];
  index?: string;
  /** Trims long explanations to a preview height (used on the home page). */
  clamp?: boolean;
  headingLevel?: 1 | 2;
}) {
  const { primary, alternates } = equivalents(term.ta_word);
  const Heading = headingLevel === 1 ? "h1" : "h2";
  // Only trim explanations that would actually overflow the preview height.
  const CLAMP_AT = 460;
  const clampTa = clamp && (term.ta_exp?.length ?? 0) > CLAMP_AT;
  const clampEn = clamp && (term.en_exp?.length ?? 0) > CLAMP_AT;
  const clampClass = "relative max-h-72 overflow-hidden";

  return (
    <article className="border border-rule bg-paper-raised">
      <header className="border-b border-rule px-5 py-5 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="label text-violet">{term.en_word}</p>
          {index ? <p className="label text-ink-faint">{index}</p> : null}
        </div>

        {primary ? (
          <Heading className="ta mt-3 text-3xl leading-tight font-semibold text-balance sm:text-4xl">
            {primary}
          </Heading>
        ) : (
          <Heading className="mt-3 text-3xl font-semibold sm:text-4xl">
            {term.en_word}
          </Heading>
        )}

        {alternates.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="label shrink-0 text-ink-faint">Also</span>
            <p className="ta text-lg text-ink-soft">
              {alternates.join(" · ")}
            </p>
          </div>
        ) : null}

        {categories && categories.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="label inline-block border border-rule px-2.5 py-1 text-ink-soft transition-colors hover:border-violet hover:text-violet"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="grid md:grid-cols-2">
        <section className="border-b border-rule px-5 py-6 sm:px-8 sm:py-8 md:border-r md:border-b-0">
          <p className="label text-ink-faint">தமிழ் விளக்கம்</p>
          {term.ta_exp ? (
            <div className={clampTa ? clampClass : undefined}>
              <p className="ta mt-4 text-[1.0625rem] whitespace-pre-line text-ink">
                {term.ta_exp}
              </p>
              {clampTa ? <Fade /> : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-faint">
              This entry has no Tamil explanation in the recovered edition.
            </p>
          )}
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <p className="label text-ink-faint">In English</p>
          {term.en_exp ? (
            <div className={clampEn ? clampClass : undefined}>
              <p className="mt-4 text-[1.0625rem] leading-relaxed whitespace-pre-line text-ink">
                {term.en_exp}
              </p>
              {clampEn ? <Fade /> : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-faint">
              No English explanation was recorded for this entry.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
