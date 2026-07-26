import { NextResponse } from "next/server";
import { normalizeQuery, suggestTerms } from "@/lib/queries";

export async function GET(request: Request) {
  const q = normalizeQuery(new URL(request.url).searchParams.get("q"));
  if (!q) return NextResponse.json({ results: [] });

  const results = await suggestTerms(q, 8);

  return NextResponse.json(
    {
      results: results.map((t) => ({
        slug: t.slug,
        en_word: t.en_word,
        ta_word: t.ta_word,
      })),
    },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}
