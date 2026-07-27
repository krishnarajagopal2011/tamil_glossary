/**
 * Shapes shared by the two data sources.
 *
 * The website reads Postgres on the server (`lib/queries.ts`); the packaged
 * Android app reads a bundled dataset in the browser (`lib/dataset/`). Both
 * return these types, so every screen component works either way.
 */

export type Term = {
  id: number;
  slug: string;
  en_word: string;
  ta_word: string | null;
  en_exp: string | null;
  ta_exp: string | null;
  initial: string;
};

export type TermRef = Pick<Term, "id" | "slug" | "en_word" | "ta_word" | "initial">;

export type CategoryRef = {
  slug: string;
  name: string;
  name_ta: string | null;
};

export type TermWithCategories = Term & {
  categories: CategoryRef[];
  missing_figures: number;
};

export type Category = CategoryRef & {
  id: number;
  description: string | null;
  term_count: number;
};

export type LetterCount = { initial: string; count: number };

export type Stats = { terms: number; categories: number; figures: number };

/** A–Z then '#', the same order the original app used for its letter grid. */
export const LETTERS: string[] = [
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  "#",
];

/**
 * Entries carry several Tamil renderings of one English term, comma separated.
 * The first is the headword; the rest are listed after it.
 */
export function equivalents(taWord: string | null | undefined) {
  const parts = (taWord ?? "")
    .split(/[,،;/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { primary: parts[0] ?? null, alternates: parts.slice(1) };
}
