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
    <ul className="mx-auto max-w-5xl divide-y divide-app-line/70 md:grid md:grid-cols-2 md:gap-px md:divide-y-0 md:bg-app-line md:p-px">
      {categories.map((c) => (
        <li key={c.slug} className="bg-app-surface">
          <Link
            href={"/category/" + c.slug}
            className="flex h-full flex-col gap-0.5 px-4 py-3.5 active:bg-app-surface-sunk md:px-6 md:py-5 md:hover:bg-app-surface-sunk"
          >
            {c.name_ta ? (
              <span className="app-ta text-[0.9375rem] font-medium text-app-accent md:text-lg">
                {c.name_ta}
              </span>
            ) : null}
            <span className="text-sm text-app-ink">{c.name}</span>
            <span className="text-xs text-app-ink-faint">
              {c.term_count.toLocaleString()} entries
            </span>
            {c.description ? (
              <span className="mt-2 hidden text-sm text-app-ink-soft md:block">
                {c.description}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
