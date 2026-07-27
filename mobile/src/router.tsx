import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * The app's router.
 *
 * There is no server here — the whole glossary is one HTML file reading a
 * bundled dataset — so navigation is just a stack of paths held in memory.
 * Keeping the same paths the website uses is what lets the screen components
 * be shared verbatim: `next/link` and `next/navigation` are aliased onto this
 * at build time (see vite.config.ts).
 */
export type Route = { path: string; query: URLSearchParams };

type RouterValue = Route & {
  canGoBack: boolean;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
};

const RouterContext = createContext<RouterValue | null>(null);

export function parseRoute(href: string): Route {
  const [path, search = ""] = href.split("?");
  return { path: path || "/", query: new URLSearchParams(search) };
}

const HOME: Route = { path: "/", query: new URLSearchParams() };

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Route[]>([HOME]);
  const current = stack[stack.length - 1];

  const push = useCallback((to: string) => {
    setStack((s) => [...s, parseRoute(to)]);
  }, []);

  const replace = useCallback((to: string) => {
    setStack((s) => [...s.slice(0, -1), parseRoute(to)]);
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  // Every screen change starts at the top, as opening a new page would.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current]);

  const value = useMemo<RouterValue>(
    () => ({ ...current, canGoBack: stack.length > 1, push, replace, back }),
    [current, stack.length, push, replace, back],
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function useRoute(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error("useRoute must be used inside <RouterProvider>");
  return value;
}
