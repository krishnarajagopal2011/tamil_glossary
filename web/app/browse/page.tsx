import type { Metadata } from "next";
import { AzRail } from "@/components/az-rail";
import { EntryRow } from "@/components/entry";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE, getLetterCounts, listTerms } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Browse A–Z",
  description:
    "Browse all 5,062 social work terms alphabetically, with Tamil equivalents and explanations.",
  alternates: { canonical: "/browse" },
};

type Props = {
  searchParams: Promise<{ letter?: string; page?: string }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;
  const letter = params.letter?.slice(0, 1).toUpperCase();
  const page = Math.max(1, Number(params.page) || 1);

  const [letters, { rows, total }] = await Promise.all([
    getLetterCounts(),
    listTerms({ letter, page }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Browse A–Z</h1>
      <p className="mt-2 text-ink-soft">
        {total.toLocaleString()} entries{letter ? ` beginning with ${letter}` : ""}.
      </p>

      <div className="mt-6">
        <AzRail counts={letters} active={letter} />
      </div>

      {rows.length > 0 ? (
        <ul className="mt-8 divide-y divide-rule border-t border-rule">
          {rows.map((term) => (
            <EntryRow key={term.id} term={term} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-ink-soft">
          No entries start with that letter. Pick another from the rail above.
        </p>
      )}

      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={(p) =>
          `/browse?${new URLSearchParams({
            ...(letter ? { letter } : {}),
            page: String(p),
          })}`
        }
      />
    </div>
  );
}
