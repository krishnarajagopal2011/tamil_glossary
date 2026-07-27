"use client";

import { useSyncExternalStore } from "react";

/**
 * How large the explanation text is set, as a step on a fixed scale.
 *
 * A reader who needs larger type needs it on every entry, so the choice is
 * remembered on the device. The value is applied to the document as
 * `--app-read-scale`; only the explanations use it, not the chrome.
 */
export const READING_STEPS = [1, 1.15, 1.3, 1.5] as const;

const KEY = "glossary-read-scale";

let step: number | null = null;
const listeners = new Set<() => void>();

function read(): number {
  if (step !== null) return step;
  if (typeof window === "undefined") return 0;
  const found = READING_STEPS.indexOf(
    Number(window.localStorage.getItem(KEY)) as (typeof READING_STEPS)[number],
  );
  step = found > 0 ? found : 0;
  return step;
}

export function setReadingStep(next: number) {
  step = ((next % READING_STEPS.length) + READING_STEPS.length) %
    READING_STEPS.length;
  try {
    window.localStorage.setItem(KEY, String(READING_STEPS[step]));
  } catch {
    /* private mode — the size still applies for this session */
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Returns [stepIndex, scale]. Renders as step 0 on the server. */
export function useReadingStep(): [number, number] {
  const current = useSyncExternalStore(subscribe, read, () => 0);
  return [current, READING_STEPS[current]];
}
