import Link from "next/link";
import { SearchBox } from "@/components/search-box";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <p className="label text-violet">404</p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
        That page is not in this glossary
      </h1>
      <p className="mt-3 text-ink-soft">
        The entry may have a different headword. Search for it, or start from
        the A–Z index.
      </p>

      <div className="mt-8 max-w-xl">
        <SearchBox size="hero" />
      </div>

      <Link
        href="/browse"
        className="label mt-6 inline-block border border-rule px-4 py-2.5 text-ink-soft transition-colors hover:border-violet hover:text-violet"
      >
        Browse A–Z →
      </Link>
    </div>
  );
}
