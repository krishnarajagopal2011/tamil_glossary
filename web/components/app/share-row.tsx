import { cx } from "@/lib/cx";
import { APP_NAME_TA, termUrl } from "@/lib/app-meta";
import { equivalents, type Term } from "@/lib/types";
import { FacebookIcon, WhatsAppIcon, XIcon } from "./icons";

/**
 * Share this entry.
 *
 * Plain links, no scripts: each opens the service's own composer with the
 * entry already written out. Inside the packaged app the webview hands an
 * off-site URL to Android, which routes it to the installed app — so tapping
 * WhatsApp opens WhatsApp rather than a browser tab of it.
 *
 * The link always points at the website, never at the device, because the
 * person receiving it has no copy of the glossary.
 */
export function ShareRow({ term }: { term: Term }) {
  const url = termUrl(term.slug);
  const { primary } = equivalents(term.ta_word);

  // Enough that the message reads on its own if the link is never opened.
  const message = [
    primary ? term.en_word + " — " + primary : term.en_word,
    APP_NAME_TA + " · Glossary of Social Work in Tamil",
  ].join("\n");

  const targets = [
    {
      label: "WhatsApp",
      Icon: WhatsAppIcon,
      href: "https://wa.me/?text=" + encodeURIComponent(message + "\n" + url),
    },
    {
      label: "X",
      Icon: XIcon,
      href:
        "https://x.com/intent/post?text=" +
        encodeURIComponent(message) +
        "&url=" +
        encodeURIComponent(url),
    },
    {
      // Facebook composes from the page's own metadata and ignores any text
      // passed with the link, so this one carries the URL alone.
      label: "Facebook",
      Icon: FacebookIcon,
      href:
        "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(url),
    },
  ];

  return (
    <section className="border-t border-app-line px-4 py-4 sm:px-6">
      <h2 className="text-[0.6875rem] tracking-wider uppercase text-app-ink-faint">
        Share this entry
      </h2>

      <ul className="mt-3 flex flex-wrap gap-2">
        {targets.map(({ label, Icon, href }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={"Share " + term.en_word + " on " + label}
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium",
                "border-app-line text-app-ink-soft transition-colors",
                "active:bg-app-surface-sunk md:hover:border-app-accent md:hover:text-app-accent",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
