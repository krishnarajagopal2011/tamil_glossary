import "server-only";
import { sql } from "./db";

export const PAGE_SIZE = 24;

export type Term = {
  id: number;
  slug: string;
  en_word: string;
  ta_word: string | null;
  en_exp: string | null;
  ta_exp: string | null;
  initial: string;
};

export type TermWithCategories = Term & {
  categories: { slug: string; name: string; name_ta: string | null }[];
  missing_figures: number;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  name_ta: string | null;
  description: string | null;
  term_count: number;
};

const TERM_FIELDS = sql`id, slug, en_word, ta_word, en_exp, ta_exp, initial`;

/**
 * Turn free text into a prefix tsquery ("child wel" -> "child:* & wel:*").
 * Punctuation is stripped so the result can never break tsquery syntax.
 */
function prefixQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .map((token) => `${token}:*`)
    .join(" & ");
}

export function normalizeQuery(input: string | undefined | null): string {
  return (input ?? "").trim().slice(0, 120);
}

/**
 * Bilingual search.
 *
 * Three signals are combined so that both languages behave well:
 *  - full-text match (english stemmer for English fields, 'simple' for Tamil)
 *  - substring match on the headwords, which is what makes agglutinative
 *    Tamil forms findable (குழந்தை matches குழந்தைகளின்)
 *  - exact / starts-with boosts so the obvious answer stays on top
 */
export async function searchTerms(
  query: string,
  { limit = PAGE_SIZE, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<{ rows: Term[]; total: number }> {
  const q = normalizeQuery(query);
  if (!q) return { rows: [], total: 0 };

  const prefix = prefixQuery(q);
  if (!prefix) return { rows: [], total: 0 };

  const like = `%${q}%`;
  const starts = `${q}%`;

  const rows = await sql<(Term & { total: number })[]>`
    WITH tq AS (
      SELECT to_tsquery('simple', ${prefix}) || to_tsquery('english', ${prefix}) AS query
    ),
    hits AS (
      SELECT ${TERM_FIELDS},
             ts_rank_cd(t.search, tq.query) AS rank,
             (lower(t.en_word) = lower(${q}))            AS is_exact,
             (t.en_word ILIKE ${starts})                 AS is_prefix,
             (t.ta_word ILIKE ${like})                   AS in_tamil_word
      FROM terms t, tq
      WHERE t.is_active
        AND (t.search @@ tq.query OR t.en_word ILIKE ${like} OR t.ta_word ILIKE ${like})
    )
    SELECT ${TERM_FIELDS}, count(*) OVER () ::int AS total
    FROM hits t
    ORDER BY is_exact DESC, is_prefix DESC, in_tamil_word DESC, rank DESC, lower(en_word)
    LIMIT ${limit} OFFSET ${offset}
  `;

  return { rows: rows.map(stripTotal), total: rows[0]?.total ?? 0 };
}

/** Short, fast result set for the search-as-you-type panel. */
export async function suggestTerms(query: string, limit = 8): Promise<Term[]> {
  const { rows } = await searchTerms(query, { limit });
  return rows;
}

export async function listTerms({
  letter,
  categorySlug,
  page = 1,
  pageSize = PAGE_SIZE,
}: {
  letter?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: Term[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const rows = await sql<(Term & { total: number })[]>`
    SELECT ${TERM_FIELDS}, count(*) OVER () ::int AS total
    FROM terms t
    WHERE t.is_active
      ${letter ? sql`AND t.initial = ${letter}` : sql``}
      ${
        categorySlug
          ? sql`AND EXISTS (
                  SELECT 1 FROM term_categories tc
                  JOIN categories c ON c.id = tc.category_id
                  WHERE tc.term_id = t.id AND c.slug = ${categorySlug}
                )`
          : sql``
      }
    ORDER BY lower(t.en_word)
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  return { rows: rows.map(stripTotal), total: rows[0]?.total ?? 0 };
}

export async function getTermBySlug(
  slug: string,
): Promise<TermWithCategories | null> {
  const [term] = await sql<TermWithCategories[]>`
    SELECT ${TERM_FIELDS},
      COALESCE(
        (SELECT json_agg(json_build_object('slug', c.slug, 'name', c.name, 'name_ta', c.name_ta)
                         ORDER BY c.sort_order)
         FROM term_categories tc JOIN categories c ON c.id = tc.category_id
         WHERE tc.term_id = t.id AND c.is_active),
        '[]'::json
      ) AS categories,
      (SELECT count(*)::int FROM images i
       WHERE i.term_id = t.id AND i.is_active AND i.file_path IS NULL) AS missing_figures
    FROM terms t
    WHERE t.slug = ${slug} AND t.is_active
  `;
  return term ?? null;
}

/** Alphabetical neighbours, for "previous / next entry" on a term page. */
export async function getNeighbours(term: Term) {
  const [prev, next] = await Promise.all([
    sql<Term[]>`
      SELECT ${TERM_FIELDS} FROM terms t
      WHERE t.is_active AND (lower(t.en_word), t.id) < (lower(${term.en_word}), ${term.id})
      ORDER BY lower(t.en_word) DESC, t.id DESC LIMIT 1
    `,
    sql<Term[]>`
      SELECT ${TERM_FIELDS} FROM terms t
      WHERE t.is_active AND (lower(t.en_word), t.id) > (lower(${term.en_word}), ${term.id})
      ORDER BY lower(t.en_word), t.id LIMIT 1
    `,
  ]);
  return { prev: prev[0] ?? null, next: next[0] ?? null };
}

export async function listCategories(): Promise<Category[]> {
  return sql<Category[]>`
    SELECT c.id, c.slug, c.name, c.name_ta, c.description,
           (SELECT count(*)::int FROM term_categories tc
            JOIN terms t ON t.id = tc.term_id
            WHERE tc.category_id = c.id AND t.is_active) AS term_count
    FROM categories c
    WHERE c.is_active
    ORDER BY c.sort_order
  `;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const [row] = await sql<Category[]>`
    SELECT c.id, c.slug, c.name, c.name_ta, c.description,
           (SELECT count(*)::int FROM term_categories tc
            JOIN terms t ON t.id = tc.term_id
            WHERE tc.category_id = c.id AND t.is_active) AS term_count
    FROM categories c WHERE c.slug = ${slug} AND c.is_active
  `;
  return row ?? null;
}

export async function getLetterCounts(): Promise<{ initial: string; count: number }[]> {
  return sql<{ initial: string; count: number }[]>`
    SELECT initial, count(*)::int AS count
    FROM terms WHERE is_active
    GROUP BY initial ORDER BY initial
  `;
}

export async function getStats() {
  const [row] = await sql<
    { terms: number; categories: number; figures: number }[]
  >`
    SELECT (SELECT count(*)::int FROM terms WHERE is_active)      AS terms,
           (SELECT count(*)::int FROM categories WHERE is_active) AS categories,
           (SELECT count(*)::int FROM images WHERE is_active)     AS figures
  `;
  return row;
}

/** One real entry, used as the specimen on the home page. */
export async function getSpecimenTerm(slug: string) {
  return getTermBySlug(slug);
}

export async function getAllTermSlugs(): Promise<{ slug: string }[]> {
  return sql<{ slug: string }[]>`
    SELECT slug FROM terms WHERE is_active ORDER BY lower(en_word)
  `;
}

function stripTotal<T extends Term & { total?: number }>(row: T): Term {
  const { id, slug, en_word, ta_word, en_exp, ta_exp, initial } = row;
  return { id, slug, en_word, ta_word, en_exp, ta_exp, initial };
}
