import { useRoute } from "../router";

/**
 * Stands in for `next/link` inside the packaged app.
 *
 * The shared screen components are written for the website and link with
 * `next/link`; aliasing that import here means they need no changes to run
 * against the in-memory router.
 */
type LinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: string;
  replace?: boolean;
  prefetch?: boolean | null;
  scroll?: boolean;
};

export default function Link({
  href,
  replace,
  onClick,
  // Accepted and dropped: they only mean something to the Next router.
  prefetch: _prefetch,
  scroll: _scroll,
  children,
  ...rest
}: LinkProps) {
  const router = useRoute();

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // An external link still belongs to the system browser.
        if (/^[a-z]+:/i.test(href)) return;
        event.preventDefault();
        if (replace) router.replace(href);
        else router.push(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
