import { Fragment } from "react";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wraps every occurrence of the search words in <mark>.
 * Works for Tamil as well as Latin because it matches on plain substrings.
 */
export function Highlight({
  text,
  query,
  className,
}: {
  text: string | null | undefined;
  query?: string;
  className?: string;
}) {
  if (!text) return null;

  const tokens = (query ?? "")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map(escapeRegExp);

  if (tokens.length === 0) return <span className={className}>{text}</span>;

  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        pattern.test(part) && i % 2 === 1 ? (
          <mark key={i}>{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
