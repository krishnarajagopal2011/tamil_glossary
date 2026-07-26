"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchBox } from "./search-box";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-rule px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-violet hover:text-violet"
      >
        <span>Search</span>
        <kbd className="label hidden border border-rule px-1.5 py-0.5 text-[0.625rem] text-ink-faint sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search the glossary"
          className="fixed inset-0 z-50 flex items-start justify-center bg-paper-sunk/80 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-full max-w-xl">
            <SearchBox size="hero" autoFocus onNavigate={close} />
            <p className="label mt-3 text-ink-faint">
              ↑ ↓ to move · ↵ to open · esc to close
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
