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

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5"
    >
      <p className="label text-ink-faint">
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="label border border-rule px-3 py-2 text-ink-soft transition-colors hover:border-violet hover:text-violet"
          >
            ← Previous
          </Link>
        ) : null}
        <span className="label px-2 text-ink-faint">
          Page {page} / {lastPage}
        </span>
        {page < lastPage ? (
          <Link
            href={buildHref(page + 1)}
            className="label border border-rule px-3 py-2 text-ink-soft transition-colors hover:border-violet hover:text-violet"
          >
            Next →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
