import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-paper-sunk">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="ta text-lg font-semibold">சமூகப்பணி கலைச்சொல் அகராதி</p>
          <p className="mt-2 max-w-sm text-sm text-ink-soft">
            A bilingual glossary of social work terminology, written in Tamil
            and English by S. Rengasamy.
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="label text-ink-faint">Read</p>
          <Link href="/browse" className="text-sm hover:text-violet">
            Browse A–Z
          </Link>
          <Link href="/categories" className="text-sm hover:text-violet">
            Categories
          </Link>
          <Link href="/about" className="text-sm hover:text-violet">
            About this edition
          </Link>
        </nav>

        <div className="flex flex-col gap-2">
          <p className="label text-ink-faint">Edition</p>
          <p className="text-sm text-ink-soft">
            Recovered from the original Android application, version 2.0.
          </p>
        </div>
      </div>

      <div className="border-t border-rule">
        <p className="label mx-auto max-w-6xl px-5 py-4 text-ink-faint sm:px-8">
          Content © S. Rengasamy
        </p>
      </div>
    </footer>
  );
}
