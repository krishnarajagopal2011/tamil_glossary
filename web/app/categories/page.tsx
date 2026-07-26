import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse the glossary by collection: abbreviations, pioneers, legislation, case work and India.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold sm:text-4xl">Collections</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Five groupings carried over from the original edition. Every other entry
        is reachable through search or the A–Z index.
      </p>

      <ul className="mt-8 grid border-t border-l border-rule bg-paper-raised sm:grid-cols-2">
        {categories.map((c) => (
          <li key={c.slug} className="border-r border-b border-rule">
            <Link
              href={`/category/${c.slug}`}
              className="flex h-full flex-col p-6 transition-colors hover:bg-violet-wash sm:p-8"
            >
              <span className="label text-ink-faint">
                {c.term_count.toLocaleString()} entries
              </span>
              {c.name_ta ? (
                <span className="ta mt-2 text-2xl font-medium">{c.name_ta}</span>
              ) : null}
              <span className="mt-1 text-sm text-ink-soft">{c.name}</span>
              {c.description ? (
                <span className="mt-4 text-sm text-ink-soft">
                  {c.description}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
