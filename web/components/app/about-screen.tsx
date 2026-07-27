import Link from "next/link";
import { APP_NAME_TA, APP_VERSION, AUTHOR_SITE } from "@/lib/app-meta";
import type { Stats } from "@/lib/types";

/**
 * The About screen as the app showed it: a plain scroll of text under the blue
 * bar, with the numbers that matter to a reader checking whether this edition
 * is complete.
 */
export function AboutScreen({ stats }: { stats: Stats }) {
  return (
    <div className="min-h-full bg-app-surface px-4 py-5 text-[0.9375rem] leading-relaxed text-app-ink">
      <h2 className="app-ta text-lg font-bold text-app-accent">
        {APP_NAME_TA}
      </h2>
      <p className="mt-1 text-sm text-app-ink-soft">
        Glossary of Social Work in Tamil — {APP_VERSION}
      </p>

      <div className="mt-5 space-y-4">
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
        <p>
          The edition was distributed as an Android application and later
          withdrawn. Its text survived only inside the installer file, in an
          encrypted database. Every one of its 12,927 pages passed its own
          checksum when it was decrypted, which is what proves the text came
          back whole.
        </p>
        <p>
          The original carried {stats.figures.toLocaleString()} illustrations.
          They were downloaded from a website that has since lapsed and were
          never stored in the app, so they are gone; only the record of which
          entry each belonged to survives.
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-app-line py-4">
        {[
          { label: "Entries", value: stats.terms.toLocaleString() },
          { label: "Collections", value: String(stats.categories) },
          { label: "Figures", value: stats.figures.toLocaleString() },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-[0.6875rem] tracking-wider uppercase text-app-ink-faint">
              {item.label}
            </dt>
            <dd className="mt-0.5 text-lg font-semibold text-app-ink">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-sm text-app-ink-soft">
        Tamil content and explanations © S. Rengasamy —{" "}
        <a
          href={AUTHOR_SITE}
          target="_blank"
          rel="noreferrer"
          className="text-app-accent underline underline-offset-4"
        >
          glossary.org.in
        </a>
        . Original software by Shekar, Ekalai Software Solutions.
      </p>

      <Link
        href="/browse"
        className="mt-6 inline-block rounded border border-app-accent px-4 py-2.5 text-sm font-medium text-app-accent"
      >
        Start reading
      </Link>
    </div>
  );
}
