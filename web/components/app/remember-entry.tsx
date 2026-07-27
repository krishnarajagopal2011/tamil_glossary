"use client";

import { useEffect } from "react";
import { remember } from "@/lib/recent";

/**
 * Records that this entry was opened. Renders nothing — it exists so the
 * Recent tab and the Meaning tab's target stay correct on a server-rendered
 * entry page.
 */
export function RememberEntry({
  slug,
  en_word,
  ta_word,
}: {
  slug: string;
  en_word: string;
  ta_word: string | null;
}) {
  useEffect(() => {
    remember({ slug, en_word, ta_word });
  }, [slug, en_word, ta_word]);

  return null;
}
