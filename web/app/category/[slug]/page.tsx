import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultList } from "@/components/app/result-list";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE, getCategory, listTerms } from "@/lib/queries";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection not found" };

  return {
    title: category.name,
    description:
      category.description ??
      `${category.term_count} social work terms in Tamil and English.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(sp.page) || 1);

  const category = await getCategory(slug);
  if (!category) notFound();

  const { rows, total } = await listTerms({ categorySlug: slug, page });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="border-b border-app-line px-4 py-3 sm:px-6">
        {category.name_ta ? (
          <h1 className="app-ta text-base font-bold text-app-accent md:text-xl">
            {category.name_ta}
          </h1>
        ) : null}
        <p className="text-sm text-app-ink-soft">{category.name}</p>
      </div>

      <ResultList
        terms={rows}
        query={category.name}
        total={total}
        caption={total.toLocaleString() + " entries in this collection"}
      />

      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={(p) => `/category/${slug}?page=${p}`}
      />
    </div>
  );
}
