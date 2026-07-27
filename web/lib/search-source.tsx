"use client";

import { createContext, useContext, useMemo } from "react";
import type { TermRef } from "./types";

/**
 * Where the search box gets its suggestions.
 *
 * On the website that is the `/api/search` route, backed by Postgres. Inside
 * the packaged app there is no server, so the app shell provides one backed by
 * the bundled dataset. The search UI itself never knows which it is talking to.
 */
export type Suggest = (
  query: string,
  signal: AbortSignal,
) => Promise<TermRef[]>;

const apiSuggest: Suggest = async (query, signal) => {
  const res = await fetch("/api/search?q=" + encodeURIComponent(query), {
    signal,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: TermRef[] };
  return data.results ?? [];
};

const SearchSourceContext = createContext<Suggest>(apiSuggest);

export function SearchSourceProvider({
  suggest,
  children,
}: {
  suggest: Suggest;
  children: React.ReactNode;
}) {
  const value = useMemo(() => suggest, [suggest]);
  return (
    <SearchSourceContext.Provider value={value}>
      {children}
    </SearchSourceContext.Provider>
  );
}

export function useSuggest(): Suggest {
  return useContext(SearchSourceContext);
}
