import { useRoute } from "../router";

/**
 * Stands in for `next/navigation` inside the packaged app — the slice of it the
 * shared screen components actually use.
 */
export function usePathname(): string {
  return useRoute().path;
}

export function useSearchParams(): URLSearchParams {
  return useRoute().query;
}

export function useRouter() {
  const route = useRoute();
  return {
    push: route.push,
    replace: route.replace,
    back: route.back,
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  };
}
