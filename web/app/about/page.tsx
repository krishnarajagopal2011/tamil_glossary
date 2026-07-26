import type { Metadata } from "next";
import Link from "next/link";
import { getStats } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About this edition",
  description:
    "How the Glossary of Social Work in Tamil was written, lost, and recovered from a single Android installer file.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <p className="label text-violet">About this edition</p>
      <h1 className="ta mt-4 text-3xl leading-snug font-semibold sm:text-4xl">
        சமூகப்பணி கலைச்சொல் அகராதி
      </h1>
      <p className="mt-2 text-xl text-ink-soft">
        Glossary of Social Work in Tamil
      </p>

      <div className="mt-10 space-y-6 text-[1.0625rem] leading-relaxed">
        <p>
          This glossary explains {stats.terms.toLocaleString()} social work
          terms in Tamil and English. It was written by{" "}
          <strong className="font-semibold">S. Rengasamy</strong>, a social work
          educator, and remains the only glossary of its kind in a language
          other than English.
        </p>

        <p>
          Each entry gives an English headword, one or more Tamil equivalents,
          and a full explanation in both languages. The Tamil explanations are
          not translations of the English ones — they are written for a Tamil
          reader, and often draw distinctions the English text does not.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="label text-ink-faint">How the text survived</h2>
        <div className="mt-4 space-y-6 text-[1.0625rem] leading-relaxed">
          <p>
            The glossary was distributed as an Android application. That app was
            withdrawn, the website it depended on expired, and no source code,
            database export, or backup survived. One installer file remained.
          </p>
          <p>
            Inside it, the glossary sat in an encrypted database. The password
            was assembled at runtime from four separate pieces of obfuscated
            code. Once those pieces were reassembled, the database decrypted
            cleanly and every one of its 12,927 pages passed its own checksum —
            proof that the text came back whole, not in fragments.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="label text-ink-faint">What is missing</h2>
        <div className="mt-4 space-y-6 text-[1.0625rem] leading-relaxed">
          <p>
            The original edition carried{" "}
            {stats.figures.toLocaleString()} illustrations. They were never
            stored in the app itself — it downloaded them from the old website
            as you read. That domain has lapsed, and no archived copy exists.
          </p>
          <p>
            Their records survive: which entry each figure belonged to, its
            file name, and its position. Entries that had figures say so. New
            images can be attached to them at any time.
          </p>
        </div>
      </section>

      <section className="mt-12 border border-rule bg-paper-raised p-6 sm:p-8">
        <h2 className="label text-ink-faint">The edition at a glance</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            { label: "Entries", value: stats.terms.toLocaleString() },
            { label: "Collections", value: stats.categories.toString() },
            { label: "Figure records", value: stats.figures.toLocaleString() },
          ].map((item) => (
            <div key={item.label}>
              <dt className="label text-ink-faint">{item.label}</dt>
              <dd className="mt-1 text-2xl font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-12 text-sm text-ink-soft">
        Content © S. Rengasamy. If you hold copies of the original
        illustrations, or spot an error in an entry, they can be added and
        corrected.
      </p>

      <Link
        href="/browse"
        className="label mt-8 inline-block border border-rule px-4 py-2.5 text-ink-soft transition-colors hover:border-violet hover:text-violet"
      >
        Start reading →
      </Link>
    </div>
  );
}
