import Link from "next/link";

const LETTERS = [
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  "#",
];

export function AzRail({
  counts,
  active,
  basePath = "/browse",
}: {
  counts: { initial: string; count: number }[];
  active?: string;
  basePath?: string;
}) {
  const map = new Map(counts.map((c) => [c.initial, c.count]));

  return (
    <nav aria-label="Browse by first letter" className="flex flex-wrap gap-1">
      {LETTERS.map((letter) => {
        const count = map.get(letter) ?? 0;
        const isActive = active === letter;

        if (count === 0) {
          return (
            <span
              key={letter}
              aria-hidden="true"
              className="label flex size-9 items-center justify-center border border-rule/50 text-[0.8125rem] text-ink-faint/50"
            >
              {letter}
            </span>
          );
        }

        return (
          <Link
            key={letter}
            href={`${basePath}?letter=${encodeURIComponent(letter)}`}
            aria-current={isActive ? "page" : undefined}
            title={`${count} entries`}
            className={`label flex size-9 items-center justify-center border text-[0.8125rem] transition-colors ${
              isActive
                ? "border-violet bg-violet text-paper-raised"
                : "border-rule text-ink hover:border-violet hover:bg-violet-wash hover:text-violet"
            }`}
          >
            {letter}
          </Link>
        );
      })}
    </nav>
  );
}
