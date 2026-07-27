"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";
import { setReadingStep, useReadingStep } from "@/lib/reading-size";
import { ContrastIcon, TextSizeIcon } from "./icons";

/**
 * The two floating controls the original app put on the entry screen: one
 * steps the explanation text up in size, the other flips to the dark reading
 * scheme. Both persist across entries.
 */
export function ReadingControls() {
  const [step, scale] = useReadingStep();
  const theme = useTheme();

  // Pushing the scale onto the document is the one thing this component owns
  // outside React, so it belongs in an effect.
  useEffect(() => {
    document.documentElement.style.setProperty("--app-read-scale", String(scale));
  }, [scale]);

  const fab =
    "app-touch rounded-full border border-app-line bg-app-surface text-app-ink-soft shadow-lg active:scale-95";

  return (
    <div className="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex flex-col gap-2 md:hidden">
      <button
        type="button"
        onClick={() => setReadingStep(step + 1)}
        aria-label={"Reading size: " + Math.round(scale * 100) + "%"}
        className={cx(fab, "relative")}
      >
        <TextSizeIcon className="size-5" />
        {step > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 rounded-full bg-app-accent px-1 text-[0.5625rem] font-semibold text-white">
            {step + 1}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={
          theme === "dark" ? "Switch to light reading" : "Switch to dark reading"
        }
        className={fab}
      >
        <ContrastIcon className="size-5" />
      </button>
    </div>
  );
}

/** The inline script in the root layout owns `data-theme`; this reads it. */
function useTheme() {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.dataset.theme ?? "light",
    () => "light",
  );
}

function setTheme(next: string) {
  document.documentElement.dataset.theme = next;
  window.localStorage.setItem("glossary-theme", next);
}
