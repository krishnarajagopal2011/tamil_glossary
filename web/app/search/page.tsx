import type { Metadata } from "next";
import { EntryRow } from "@/components/entry";
import { Pagination } from "@/components/pagination";
import { SearchBox } from "@/components/search-box";
import { PAGE_SIZE, normalizeQuery, searchTerms } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = normalizeQuery(params.q);
  const page = Math.max(1, Number(params.page) || 1);

  const { rows, total } = query
    ? await searchTerms(query, {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      })
    : { rows: [], total: 0 };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Search</h1>

      <div className="mt-6 max-w-2xl">
        <SearchBox size="hero" initialQuery={query} />
      </div>

      {query ? (
        <p className="label mt-6 text-ink-faint">
          {total.toLocaleString()} {total === 1 ? "entry" : "entries"} for “
          {query}”
        </p>
      ) : (
        <p className="mt-6 text-ink-soft">
          Type an English term or a Tamil word. Both the headwords and the
          explanations are searched.
        </p>
      )}

      {query && rows.length === 0 ? (
        <p className="mt-8 max-w-xl text-ink-soft">
          No entry matches that. Try a shorter word, drop any suffix, or browse
          A–Z.
        </p>
      ) : null}

      {rows.length > 0 ? (
        <ul className="mt-6 divide-y divide-rule border-t border-rule">
          {rows.map((term) => (
            <EntryRow key={term.id} term={term} query={query} />
          ))}
        </ul>
      ) : null}

      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={(p) =>
          `/search?${new URLSearchParams({ q: query, page: String(p) })}`
        }
      />
    </div>
  );
}
