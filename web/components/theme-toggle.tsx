"use client";

import { useSyncExternalStore } from "react";

/** The inline script in the root layout owns `data-theme`; this reads it. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme ?? "light",
    () => "light",
  );

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("glossary-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="label border border-rule px-2.5 py-1.5 text-ink-soft transition-colors hover:border-violet hover:text-violet"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
