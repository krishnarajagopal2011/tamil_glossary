import Link from "next/link";
import { cx } from "@/lib/cx";
import { LETTERS, type LetterCount } from "@/lib/types";

/**
 * The Home tab: one tile per letter, four to a row.
 *
 * Each tile carries the portrait of a social work figure whose name begins
 * with that letter, recovered from the original installer's own drawables —
 * they were bundled in the app, unlike the 14,101 entry figures, which were
 * fetched from a domain that has since lapsed and are gone.
 *
 * The originals are mdpi only, 80px square for the most part, so they are soft
 * when a tile is wider than that. Upscaling them would invent detail the
 * edition never had; they are shown as they shipped.
 */
export function HomeGrid({ counts }: { counts: LetterCount[] }) {
  const byLetter = new Map(counts.map((c) => [c.initial, c.count]));

  return (
    <div className="bg-app-surface-sunk">
    <ul className="mx-auto grid max-w-5xl grid-cols-4 gap-2 p-2 sm:grid-cols-6 sm:gap-3 sm:p-4 lg:grid-cols-7">
      {LETTERS.map((letter, i) => {
        const count = byLetter.get(letter) ?? 0;
        const label = letter === "#" ? "Other" : letter;

        if (count === 0) {
          return (
            <li key={letter}>
              <div
                aria-hidden="true"
                className="flex flex-col overflow-hidden rounded border border-app-line opacity-45"
              >
                <TileFace letter={letter} label={label} index={i} muted />
                <Footer letter={label} count={0} />
              </div>
            </li>
          );
        }

        return (
          <li key={letter}>
            <Link
              href={"/browse?letter=" + encodeURIComponent(letter)}
              // The tile is a monogram and a number; spelling it out keeps the
              // link from reaching a screen reader unnamed.
              aria-label={label + " — " + count.toLocaleString() + " entries"}
              className={cx(
                "flex flex-col overflow-hidden rounded border-2 border-app-tile-border",
                "bg-app-surface transition-transform active:scale-[0.97]",
              )}
            >
              <TileFace letter={letter} label={label} index={i} />
              <Footer letter={label} count={count} />
            </Link>
          </li>
        );
      })}
    </ul>
    </div>
  );
}

/**
 * The tile face: the recovered portrait where there is one.
 *
 * The monogram underneath is not only a fallback for '#', which never had a
 * picture — it is what shows through while the image loads, and what remains
 * if a file is ever missing, so the grid never collapses to empty boxes.
 */
function TileFace({
  letter,
  label,
  index,
  muted = false,
}: {
  /** The raw initial, which is also the image's filename. */
  letter: string;
  /** What a reader sees: '#' is written out as "Other". */
  label: string;
  index: number;
  muted?: boolean;
}) {
  const hue = 200 + ((index * 7) % 22);
  const light = 40 + ((index * 11) % 15);
  const hasPortrait = /^[A-Z]$/.test(letter);

  return (
    <span
      aria-hidden="true"
      className="relative flex aspect-4/3 items-center justify-center overflow-hidden"
      style={{
        background: muted
          ? "var(--app-surface-sunk)"
          : "linear-gradient(150deg, hsl(" +
            hue +
            " 55% " +
            light +
            "%), hsl(" +
            (hue + 14) +
            " 48% " +
            (light - 12) +
            "%))",
      }}
    >
      <span
        className={cx(
          "leading-none font-semibold",
          // "Other" has to sit on the same tile as a single capital.
          label.length > 1
            ? "text-base tracking-normal"
            : "text-[2.75rem] tracking-tight",
          muted ? "text-app-ink-faint" : "text-white/95",
        )}
      >
        {label}
      </span>

      {hasPortrait ? (
        // Plain <img>: these are 80px files served from the same bundle as the
        // page, so the optimiser has nothing to do and the packaged app has no
        // server to do it with.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={"/tiles/" + letter.toLowerCase() + ".jpg"}
          alt=""
          loading="lazy"
          decoding="async"
          className={cx(
            "absolute inset-0 size-full object-cover",
            muted && "opacity-60 grayscale",
          )}
        />
      ) : null}
    </span>
  );
}

function Footer({ letter, count }: { letter: string; count: number }) {
  return (
    <span className="flex items-baseline justify-between gap-1 px-2 py-1.5">
      <span className="text-[0.9375rem] font-bold text-app-accent">
        {letter}
      </span>
      <span className="text-xs tabular-nums text-app-ink-soft">{count}</span>
    </span>
  );
}
