import Link from "next/link";
import { APP_NAME_TA, APP_VERSION, AUTHOR_SITE } from "@/lib/app-meta";

const links = [
  { href: "/browse", label: "Index" },
  { href: "/categories", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * The website's footer. The app has none — it has a drawer — so this is
 * rendered by the Next layout only, and carries the credit and the licence
 * that a reader arriving from a shared link has no other way to see.
 */
export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-app-line bg-app-surface-sunk">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="app-ta text-base font-bold text-app-accent">
            {APP_NAME_TA}
          </p>
          <p className="mt-1 text-sm text-app-ink-soft">
            Glossary of Social Work in Tamil — {APP_VERSION}
          </p>
          <p className="mt-3 max-w-md text-sm text-app-ink-faint">
            5,062 terms explained in Tamil and English by Prof. S. Rengasamy,
            Retired Professor of Social Work —{" "}
            <a
              href={AUTHOR_SITE}
              target="_blank"
              rel="noreferrer"
              className="text-app-accent underline underline-offset-4"
            >
              glossary.org.in
            </a>
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-app-ink-soft hover:text-app-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="border-t border-app-line px-4 py-4 text-center text-xs text-app-ink-faint sm:px-6">
        Glossary © Prof. S. Rengasamy, free for non-commercial use under CC
        BY-NC 4.0 with attribution. Software MIT.
      </p>
    </footer>
  );
}
