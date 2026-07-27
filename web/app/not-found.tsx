import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-[0.9375rem] text-app-ink">
        That page is not in this glossary.
      </p>
      <p className="mt-2 text-sm text-app-ink-soft">
        The entry may have a different headword. Search from the bar above, or
        start from the index.
      </p>
      <Link
        href="/browse"
        className="mt-6 inline-block rounded border border-app-accent px-4 py-2.5 text-sm font-medium text-app-accent"
      >
        Open the index
      </Link>
    </div>
  );
}
