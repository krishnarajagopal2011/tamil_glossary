import type { Metadata } from "next";
import { ResultList } from "@/components/app/result-list";
import { Pagination } from "@/components/pagination";
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
    <div className="mx-auto max-w-5xl">
      <ResultList terms={rows} query={query} total={total} />
      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={(p) =>
          "/search?" + new URLSearchParams({ q: query, page: String(p) })
        }
      />
    </div>
  );
}
