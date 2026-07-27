"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRecent } from "@/lib/recent";

const noop = () => () => {};

export function MeaningRedirect() {
  const router = useRouter();
  const recent = useRecent();
  const last = recent[0];

  // The recent list is unreadable until the client takes over. Rendering
  // nothing until then keeps the empty state from flashing at a reader who
  // does have an entry open.
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  useEffect(() => {
    // `replace`, not `push`: the empty state should not sit in the back stack
    // between the index and the entry the reader actually wanted.
    if (last) router.replace("/term/" + last.slug);
  }, [last, router]);

  if (!hydrated || last) return null;

  return (
    <div className="app px-4 py-12 md:mx-auto md:max-w-3xl md:px-8">
      <p className="text-[0.9375rem] text-app-ink-soft md:text-ink-soft">
        No entry is open yet.
      </p>
      <p className="mt-2 text-sm text-app-ink-faint md:text-ink-soft">
        Pick a letter from Home, or open the index and choose a term. It will
        show up here.
      </p>
      <Link
        href="/browse"
        className="mt-6 inline-block rounded border border-app-accent px-4 py-2.5 text-sm font-medium text-app-accent"
      >
        Open the index
      </Link>
    </div>
  );
}
