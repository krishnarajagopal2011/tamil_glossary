import Link from "next/link";
import { AzRail } from "@/components/az-rail";
import { EntryPanel } from "@/components/entry";
import { SearchBox } from "@/components/search-box";
import {
  getLetterCounts,
  getSpecimenTerm,
  getStats,
  listCategories,
} from "@/lib/queries";

export const revalidate = 3600;

/** The entry shown on the front page: one English word, six Tamil renderings. */
const SPECIMEN_SLUG = "empathy";

export default async function HomePage() {
  const [stats, letters, categories, specimen] = await Promise.all([
    getStats(),
    getLetterCounts(),
    listCategories(),
    getSpecimenTerm(SPECIMEN_SLUG),
  ]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-10 sm:px-8 sm:pt-20">
        <p className="label rise text-violet" style={{ "--i": 0 } as never}>
          {stats.terms.toLocaleString()} entries · English ⇄ தமிழ்
        </p>

        <h1
          className="ta rise mt-5 max-w-4xl text-4xl leading-[1.15] font-semibold text-balance sm:text-6xl"
          style={{ "--i": 1 } as never}
        >
          சமூகப்பணி கலைச்சொல் அகராதி
        </h1>

        <p
          className="rise mt-5 max-w-2xl text-lg text-ink-soft sm:text-xl"
          style={{ "--i": 2 } as never}
        >
          The Glossary of Social Work in Tamil. Every term carries its Tamil
          equivalents and a full explanation in both languages — written by{" "}
          <Link
            href="/about"
            className="text-violet underline-offset-4 hover:underline"
          >
            S. Rengasamy
          </Link>
          .
        </p>

        <div className="rise mt-9 max-w-2xl" style={{ "--i": 3 } as never}>
          <SearchBox size="hero" />
        </div>

        <div className="rise mt-8" style={{ "--i": 4 } as never}>
          <p className="label mb-2 text-ink-faint">Browse by letter</p>
          <AzRail counts={letters} />
        </div>
      </section>

      {specimen ? (
        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="label text-ink-faint">A specimen entry</h2>
            <Link
              href={`/term/${specimen.slug}`}
              className="label text-violet transition-opacity hover:opacity-70"
            >
              Open this entry →
            </Link>
          </div>
          <EntryPanel
            term={specimen}
            categories={specimen.categories}
            index={`one of ${stats.terms.toLocaleString()}`}
            headingLevel={2}
            clamp
          />
          <p className="mt-4 max-w-2xl text-sm text-ink-soft">
            One English headword, six Tamil renderings, and an explanation that
            separates it from பரிவு and அனுதாபம். Most entries here do the same
            work.
          </p>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="label text-ink-faint">Collections</h2>
          <Link
            href="/categories"
            className="label text-violet transition-opacity hover:opacity-70"
          >
            All collections →
          </Link>
        </div>

        <ul className="grid border-t border-l border-rule bg-paper-raised sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug} className="border-r border-b border-rule">
              <Link
                href={`/category/${c.slug}`}
                className="flex h-full flex-col p-6 transition-colors hover:bg-violet-wash"
              >
                <span className="label text-ink-faint">
                  {c.term_count.toLocaleString()} entries
                </span>
                {c.name_ta ? (
                  <span className="ta mt-2 text-2xl font-medium">
                    {c.name_ta}
                  </span>
                ) : null}
                <span className="mt-1 text-sm text-ink-soft">{c.name}</span>
                {c.description ? (
                  <span className="mt-3 text-sm text-ink-soft">
                    {c.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="border border-rule bg-paper-raised p-6 sm:p-10">
          <h2 className="label text-ink-faint">This edition</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed">
            The glossary was published as an Android app and later withdrawn.
            Its text survived only inside the installer file. Every entry here
            was decrypted from that file and verified page by page — all{" "}
            {stats.terms.toLocaleString()} of them.
          </p>
          <Link
            href="/about"
            className="label mt-6 inline-block border border-rule px-4 py-2.5 text-ink-soft transition-colors hover:border-violet hover:text-violet"
          >
            How the text was recovered →
          </Link>
        </div>
      </section>
    </>
  );
}
