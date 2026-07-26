import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryPanel } from "@/components/entry";
import { getNeighbours, getTermBySlug } from "@/lib/queries";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

function summarise(term: { en_exp: string | null; ta_word: string | null }) {
  const english = term.en_exp?.replace(/\s+/g, " ").slice(0, 150);
  return [term.ta_word, english].filter(Boolean).join(" — ").slice(0, 300);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = await getTermBySlug(slug);
  if (!term) return { title: "Entry not found" };

  const title = term.ta_word
    ? `${term.en_word} — ${term.ta_word.split(",")[0].trim()}`
    : term.en_word;

  return {
    title,
    description: summarise(term),
    alternates: { canonical: `/term/${term.slug}` },
    openGraph: {
      title: `${title} — Glossary of Social Work in Tamil`,
      description: summarise(term),
      type: "article",
    },
  };
}

export default async function TermPage({ params }: Props) {
  const { slug } = await params;
  const term = await getTermBySlug(slug);
  if (!term) notFound();

  const { prev, next } = await getNeighbours(term);

  // Structured data helps search engines and AI assistants quote the entry.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.en_word,
    alternateName: term.ta_word ?? undefined,
    description: term.en_exp ?? term.ta_exp ?? undefined,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Glossary of Social Work in Tamil",
      author: { "@type": "Person", name: "S. Rengasamy" },
    },
    inLanguage: ["en", "ta"],
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="label mb-6 flex items-center gap-2 text-ink-faint">
        <Link href="/" className="hover:text-violet">
          Glossary
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/browse?letter=${encodeURIComponent(term.initial)}`}
          className="hover:text-violet"
        >
          {term.initial}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink-soft">{term.en_word}</span>
      </nav>

      <EntryPanel term={term} categories={term.categories} />

      {term.missing_figures > 0 ? (
        <p className="mt-4 border-l-2 border-rule pl-4 text-sm text-ink-soft">
          The original edition carried {term.missing_figures}{" "}
          {term.missing_figures === 1 ? "figure" : "figures"} with this entry.
          The image files were served from the old website and did not survive;
          only their records did.
        </p>
      ) : null}

      <nav className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/term/${prev.slug}`}
            className="group bg-paper-raised p-5 transition-colors hover:bg-violet-wash"
          >
            <span className="label text-ink-faint">← Previous entry</span>
            <span className="mt-2 block text-ink group-hover:text-violet">
              {prev.en_word}
            </span>
          </Link>
        ) : (
          <span className="bg-paper-raised p-5" />
        )}
        {next ? (
          <Link
            href={`/term/${next.slug}`}
            className="group bg-paper-raised p-5 text-right transition-colors hover:bg-violet-wash"
          >
            <span className="label text-ink-faint">Next entry →</span>
            <span className="mt-2 block text-ink group-hover:text-violet">
              {next.en_word}
            </span>
          </Link>
        ) : (
          <span className="bg-paper-raised p-5" />
        )}
      </nav>
    </div>
  );
}
