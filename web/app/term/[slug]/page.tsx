import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeaningView } from "@/components/app/meaning-view";
import { ReadingControls } from "@/components/app/reading-controls";
import {
  getNeighbours,
  getPositionInLetter,
  getTermBySlug,
} from "@/lib/queries";

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

  const [{ prev, next }, position] = await Promise.all([
    getNeighbours(term),
    getPositionInLetter(term),
  ]);

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeaningView term={term} position={position} prev={prev} next={next} />
      <ReadingControls />
    </>
  );
}
