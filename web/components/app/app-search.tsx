"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { useSuggest } from "@/lib/search-source";
import type { TermRef } from "@/lib/types";
import { equivalents } from "@/lib/types";
import { SearchIcon } from "./icons";

/**
 * The search field in the app bar.
 *
 * It sits on the blue bar with an underline, the way the original did.
 * Suggestions drop into a sheet below the bar; picking one opens the entry,
 * pressing enter opens the full result list.
 */
export function AppSearch() {
  const router = useRouter();
  const suggest = useSuggest();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TermRef[]>([]);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();

  // Derived, not cleared in an effect: a query under two characters simply has
  // nothing to show, and the last results stay put while the next ones load.
  const visible = trimmed.length >= 2 ? results : [];

  useEffect(() => {
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setResults(await suggest(trimmed, controller.signal));
      } catch {
        /* aborted, or offline on the website — keep the last results */
      }
    }, 120);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed, suggest]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  }

  const showSheet = open && trimmed.length >= 2;

  return (
    <div ref={rootRef} className="min-w-0 flex-1">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) go("/search?q=" + encodeURIComponent(trimmed));
        }}
        className="flex items-center gap-2 border-b border-app-bar-ink/60 pb-1"
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search in Glossary"
          aria-label="Search the glossary"
          aria-expanded={showSheet}
          aria-controls={listId}
          aria-autocomplete="list"
          role="combobox"
          enterKeyHint="search"
          className="w-full bg-transparent py-1.5 text-[1.0625rem] text-app-bar-ink placeholder:text-app-bar-ink-dim focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="app-touch -mr-2 shrink-0 text-app-bar-ink"
        >
          <SearchIcon className="size-5" />
        </button>
      </form>

      {showSheet ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute inset-x-0 top-full mx-auto max-h-[65vh] max-w-5xl overflow-y-auto overscroll-contain border-b border-app-line bg-app-surface shadow-lg md:rounded-b md:border-x"
        >
          {visible.length === 0 ? (
            <p className="px-4 py-4 text-sm text-app-ink-soft">
              No entry matches that yet. Try a shorter word.
            </p>
          ) : (
            <ul className="divide-y divide-app-line">
              {visible.map((result) => {
                const { primary } = equivalents(result.ta_word);
                return (
                  <li key={result.slug} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => go("/term/" + result.slug)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left active:bg-app-surface-sunk"
                    >
                      <span className="text-[0.9375rem] font-medium text-app-ink">
                        {result.en_word}
                      </span>
                      {primary ? (
                        <span className="app-ta text-sm text-app-accent">
                          {primary}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => go("/search?q=" + encodeURIComponent(trimmed))}
                  className={cx(
                    "w-full px-4 py-3.5 text-left text-sm font-medium",
                    "text-app-accent active:bg-app-surface-sunk",
                  )}
                >
                  See all results for “{trimmed}”
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
