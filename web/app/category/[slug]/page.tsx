import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryRow } from "@/components/entry";
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
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <p className="label text-violet">Collection</p>
      {category.name_ta ? (
        <h1 className="ta mt-3 text-3xl font-semibold sm:text-4xl">
          {category.name_ta}
        </h1>
      ) : null}
      <p className="mt-1 text-xl text-ink-soft">{category.name}</p>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-ink-soft">{category.description}</p>
      ) : null}
      <p className="label mt-4 text-ink-faint">
        {total.toLocaleString()} entries
      </p>

      <ul className="mt-8 divide-y divide-rule border-t border-rule">
        {rows.map((term) => (
          <EntryRow key={term.id} term={term} />
        ))}
      </ul>

      <Pagination
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        buildHref={(p) => `/category/${slug}?page=${p}`}
      />
    </div>
  );
}
