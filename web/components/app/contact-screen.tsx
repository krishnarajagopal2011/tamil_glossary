import { AUTHOR_SITE, CONTACT_EMAIL, SOFTWARE_SITE } from "@/lib/app-meta";

/**
 * Contact, shared by the website and the packaged app. It inherits colour and
 * size from whatever wraps it, so the same markup reads correctly on the blue
 * app skin and on the website's paper.
 */
export function ContactScreen() {
  return (
    <>
      <section>
        <h2 className="text-xs tracking-wider uppercase opacity-70">
          Glossary and Tamil explanations
        </h2>
        <p className="mt-1 font-medium">Prof. S. Rengasamy</p>
        <p className="opacity-80">Retired Professor of Social Work</p>
        <a
          href={AUTHOR_SITE}
          target="_blank"
          rel="noreferrer"
          className="text-app-accent underline underline-offset-4 md:text-violet"
        >
          glossary.org.in
        </a>
      </section>

      <section className="mt-8">
        <h2 className="text-xs tracking-wider uppercase opacity-70">Support</h2>
        <p className="mt-1">
          For support, or to report a mistake in an entry, write to{" "}
          <a
            href={"mailto:" + CONTACT_EMAIL}
            className="text-app-accent underline underline-offset-4 md:text-violet"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xs tracking-wider uppercase opacity-70">
          Special thanks
        </h2>
        <p className="mt-1 font-medium">Shekar, Ekalai Software Solutions</p>
        <a
          href={SOFTWARE_SITE}
          target="_blank"
          rel="noreferrer"
          className="text-app-accent underline underline-offset-4 md:text-violet"
        >
          ekalai.com
        </a>
      </section>

      <section className="mt-8">
        <h2 className="text-xs tracking-wider uppercase opacity-70">Licence</h2>
        <p className="mt-1">
          The software is released under the MIT licence. The glossary itself —
          every headword, Tamil equivalent and explanation — is © Prof. S.
          Rengasamy and released for free non-commercial use under{" "}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/"
            target="_blank"
            rel="noreferrer"
            className="text-app-accent underline underline-offset-4 md:text-violet"
          >
            CC BY-NC 4.0
          </a>
          .
        </p>
        <p className="mt-2">
          Any citation, adaptation or derivative work must credit Prof. S.
          Rengasamy as the original author.
        </p>
      </section>
    </>
  );
}
