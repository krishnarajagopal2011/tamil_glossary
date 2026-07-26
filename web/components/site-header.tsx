import Link from "next/link";
import { SearchDialog } from "./search-dialog";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { href: "/browse", label: "Browse" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="group flex min-w-0 flex-col leading-none">
          <span className="ta truncate text-base font-semibold text-ink transition-colors group-hover:text-violet">
            சமூகப்பணி கலைச்சொல் அகராதி
          </span>
          <span className="label mt-1 text-ink-faint">
            Glossary of Social Work
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-5 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label text-ink-soft transition-colors hover:text-violet"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex items-center gap-5 border-t border-rule px-5 py-2 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="label text-ink-soft transition-colors hover:text-violet"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
