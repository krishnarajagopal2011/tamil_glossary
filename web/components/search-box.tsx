"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Suggestion = { slug: string; en_word: string; ta_word: string | null };

export function SearchBox({
  size = "default",
  autoFocus = false,
  initialQuery = "",
  onNavigate,
}: {
  size?: "default" | "hero";
  autoFocus?: boolean;
  initialQuery?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  // Suggestions only appear once the reader interacts, so the panel never
  // covers the results already on the page.
  const [touched, setTouched] = useState(false);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  // Results are derived, not cleared in an effect: a query shorter than two
  // characters simply shows nothing.
  const visible = trimmed.length >= 2 ? results : [];

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setPending(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(-1);
        if (touched) setOpen(true);
      } catch {
        /* aborted or offline — leave the last results in place */
      } finally {
        setPending(false);
      }
    }, 140);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, touched]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function go(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, visible.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && visible[active]) go(`/term/${visible[active].slug}`);
      else if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const hero = size === "hero";

  return (
    <div ref={boxRef} className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        className={`flex items-center gap-3 border bg-paper-raised transition-colors focus-within:border-violet ${
          hero ? "border-rule-strong px-5 py-4" : "border-rule px-3.5 py-2.5"
        }`}
      >
        <SearchIcon
          className={`shrink-0 text-ink-faint ${hero ? "size-5" : "size-4"}`}
        />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setTouched(true);
            setQuery(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            setTouched(true);
            if (visible.length > 0) setOpen(true);
          }}
          placeholder="Search in English or Tamil"
          aria-label="Search the glossary"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          role="combobox"
          className={`w-full bg-transparent text-ink placeholder:text-ink-faint focus:outline-none [&::-webkit-search-cancel-button]:appearance-none ${
            hero ? "text-lg sm:text-xl" : "text-sm"
          }`}
        />
        {pending ? (
          <span className="label shrink-0 text-ink-faint">…</span>
        ) : null}
      </form>

      {open && visible.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+0.375rem)] z-40 max-h-[22rem] overflow-y-auto border border-rule bg-paper-raised shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]"
        >
          {visible.map((r, i) => (
            <li key={r.slug} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(`/term/${r.slug}`)}
                className={`flex w-full flex-col items-start gap-0.5 border-l-2 px-4 py-2.5 text-left transition-colors ${
                  i === active
                    ? "border-violet bg-violet-wash"
                    : "border-transparent"
                }`}
              >
                <span className="label text-ink-faint">{r.en_word}</span>
                {r.ta_word ? (
                  <span className="ta text-base leading-snug text-ink">
                    {r.ta_word}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
              className="label w-full border-t border-rule px-4 py-3 text-left text-violet"
            >
              See all results for “{query.trim()}”
            </button>
          </li>
        </ul>
      ) : null}

      {open && !pending && trimmed.length >= 2 && visible.length === 0 ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.375rem)] z-40 border border-rule bg-paper-raised px-4 py-3 text-sm text-ink-soft">
          No entry matches that. Try a shorter word, or browse A–Z.
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m13.5 13.5 4 4" strokeLinecap="round" />
    </svg>
  );
}
