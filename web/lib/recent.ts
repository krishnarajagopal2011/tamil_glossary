"use client";

import { useSyncExternalStore } from "react";

/**
 * The entries this reader has opened, newest first.
 *
 * The original app kept a Recent tab and remembered which entry the Meaning
 * tab should show; both come from here. It lives in localStorage, so it stays
 * on the device and works offline in the packaged app.
 */
export type RecentEntry = {
  slug: string;
  en_word: string;
  ta_word: string | null;
};

const KEY = "glossary-recent";
const LIMIT = 60;

let cache: RecentEntry[] | null = null;
const listeners = new Set<() => void>();
const EMPTY: RecentEntry[] = [];

function read(): RecentEntry[] {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter(
          (e): e is RecentEntry =>
            typeof e?.slug === "string" && typeof e?.en_word === "string",
        )
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function commit(next: RecentEntry[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode, or the quota is full — the tab still works this session */
  }
  for (const listener of listeners) listener();
}

export function remember(entry: RecentEntry) {
  if (typeof window === "undefined") return;
  const rest = read().filter((e) => e.slug !== entry.slug);
  commit([entry, ...rest].slice(0, LIMIT));
}

export function forgetAll() {
  commit([]);
}

/** The entry the Meaning tab opens when nothing else is selected. */
export function lastOpened(): RecentEntry | null {
  return read()[0] ?? null;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab (or another webview) writing the same key should show up here.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useRecent(): RecentEntry[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
