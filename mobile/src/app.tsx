import { useCallback, useEffect, useState } from "react";
import { AppChrome } from "@/components/app/app-chrome";
import { AboutScreen } from "@/components/app/about-screen";
import { ContactScreen } from "@/components/app/contact-screen";
import { HomeGrid } from "@/components/app/home-grid";
import { IndexList } from "@/components/app/index-list";
import { MeaningView } from "@/components/app/meaning-view";
import { ReadingControls } from "@/components/app/reading-controls";
import { RecentList } from "@/components/app/recent-list";
import { ResultList } from "@/components/app/result-list";
import { APP_VERSION } from "@/lib/app-meta";
import { SearchSourceProvider, type Suggest } from "@/lib/search-source";
import type { Term, TermWithCategories } from "@/lib/types";
import { useHardwareBack } from "./back-button";
import { glossary } from "./glossary";
import { RouterProvider, useRoute } from "./router";

export function App() {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    glossary.load().then(
      () => setState("ready"),
      (error: unknown) => {
        console.error("dataset failed to load", error);
        setState("failed");
      },
    );
  }, []);

  if (state === "loading") return <Splash />;
  if (state === "failed") return <LoadFailed />;

  return (
    <RouterProvider>
      <Shell />
    </RouterProvider>
  );
}

/** Suggestions come from the bundled index, so they need no network. */
const suggest: Suggest = async (query) => glossary.search(query, 8);

function Shell() {
  useHardwareBack();

  return (
    <SearchSourceProvider suggest={suggest}>
      <div className="app flex min-h-dvh flex-col bg-app-surface">
        <AppChrome version={APP_VERSION} />
        <main className="flex-1">
          <Screen />
        </main>
      </div>
    </SearchSourceProvider>
  );
}

function Screen() {
  const { path, query } = useRoute();

  if (path === "/") {
    return <HomeGrid counts={glossary.letterCounts()} />;
  }

  if (path === "/browse") {
    const letter = (query.get("letter") ?? "A").toUpperCase();
    return (
      <IndexList
        letter={letter}
        terms={glossary.listByLetter(letter)}
        counts={glossary.letterCounts()}
      />
    );
  }

  if (path.startsWith("/term/")) {
    return <EntryScreen slug={decodeURIComponent(path.slice("/term/".length))} />;
  }

  if (path === "/search") {
    return <SearchScreen query={query.get("q") ?? ""} />;
  }

  if (path === "/recent") return <RecentList />;
  if (path === "/meaning") return <NoEntryOpen />;

  if (path === "/about") {
    return (
      <div className="bg-app-surface">
        <AboutScreen stats={glossary.stats()} />
      </div>
    );
  }

  if (path === "/contact") {
    return (
      <div className="bg-app-surface px-4 py-6 text-[0.9375rem] leading-relaxed text-app-ink">
        <ContactScreen />
      </div>
    );
  }

  return <NotFound path={path} />;
}

function EntryScreen({ slug }: { slug: string }) {
  const [term, setTerm] = useState<TermWithCategories | null | "missing">(null);

  useEffect(() => {
    let live = true;
    setTerm(null);
    glossary.getTerm(slug).then((found) => {
      if (live) setTerm(found ?? "missing");
    });
    return () => {
      live = false;
    };
  }, [slug]);

  if (term === null) return <Waiting />;
  if (term === "missing") return <NotFound path={"/term/" + slug} />;

  const { prev, next } = glossary.neighbours(slug);

  return (
    <>
      <MeaningView
        term={term}
        position={glossary.positionInLetter(slug)}
        prev={prev}
        next={next}
      />
      <ReadingControls />
    </>
  );
}

function SearchScreen({ query }: { query: string }) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [pending, setPending] = useState(false);

  const run = useCallback(async (q: string) => {
    if (!q) return [] as Term[];
    // The index holds only headwords, so the full entries behind the hits are
    // read from their shards before the list can show a line of context.
    const hits = await glossary.searchDeep(q, 40);
    const full = await Promise.all(hits.map((hit) => glossary.getTerm(hit.slug)));
    return full.filter((t): t is TermWithCategories => t !== null);
  }, []);

  useEffect(() => {
    let live = true;
    setPending(true);
    run(query).then((found) => {
      if (!live) return;
      setTerms(found);
      setPending(false);
    });
    return () => {
      live = false;
    };
  }, [query, run]);

  if (pending && query) return <Waiting />;

  return <ResultList terms={terms} query={query} total={terms.length} />;
}

function NoEntryOpen() {
  return (
    <div className="bg-app-surface px-4 py-12">
      <p className="text-[0.9375rem] text-app-ink-soft">No entry is open yet.</p>
      <p className="mt-2 text-sm text-app-ink-faint">
        Pick a letter from Home, or open the index and choose a term.
      </p>
    </div>
  );
}

function NotFound({ path }: { path: string }) {
  return (
    <div className="bg-app-surface px-4 py-12">
      <p className="text-[0.9375rem] text-app-ink-soft">
        Nothing lives at {path}.
      </p>
    </div>
  );
}

function Waiting() {
  return (
    <div className="flex items-center justify-center bg-app-surface py-16">
      <span className="size-7 animate-spin rounded-full border-2 border-app-line border-t-app-accent" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function Splash() {
  return (
    <div className="app flex min-h-dvh flex-col items-center justify-center gap-4 bg-app-bar px-8 text-center text-app-bar-ink">
      <span className="flex size-16 items-center justify-center rounded-full border-2 border-app-bar-ink/70 text-xl font-semibold">
        அ/A
      </span>
      <p className="app-ta text-lg font-medium">சமூகப்பணி கலைச்சொல் அகராதி</p>
      <p className="text-sm text-app-bar-ink-dim">Glossary of Social Work in Tamil</p>
    </div>
  );
}

function LoadFailed() {
  return (
    <div className="app flex min-h-dvh flex-col items-center justify-center gap-3 bg-app-surface px-8 text-center">
      <p className="text-[0.9375rem] text-app-ink">
        The glossary could not be opened.
      </p>
      <p className="text-sm text-app-ink-soft">
        The bundled data appears to be damaged. Reinstalling the app restores
        it.
      </p>
    </div>
  );
}
