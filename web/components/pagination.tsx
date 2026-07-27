import Link from "next/link";

export function Pagination({
  page,
  total,
  pageSize,
  buildHref,
}: {
  page: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (lastPage <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const step =
    "rounded border border-app-line px-3 py-2 text-sm text-app-ink-soft transition-colors hover:border-app-accent hover:text-app-accent";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-app-line px-4 py-4 sm:px-6"
    >
      <p className="text-xs text-app-ink-faint">
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className={step}>
            ← Previous
          </Link>
        ) : null}
        <span className="px-2 text-xs text-app-ink-faint">
          Page {page} / {lastPage}
        </span>
        {page < lastPage ? (
          <Link href={buildHref(page + 1)} className={step}>
            Next →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
