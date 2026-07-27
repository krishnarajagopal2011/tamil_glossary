import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  Literata,
  Noto_Sans_Tamil,
  Noto_Serif_Tamil,
} from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/app/app-chrome";
import { SiteFooter } from "@/components/app/site-footer";
import { APP_BAR_COLOR, APP_NAME, APP_VERSION } from "@/lib/app-meta";
import { cx } from "@/lib/cx";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  display: "swap",
});

const notoTamil = Noto_Serif_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil", "latin"],
  display: "swap",
});

// The phone view sets Tamil and Latin in one sans face, as the app edition did.
const notoSansTamil = Noto_Sans_Tamil({
  variable: "--font-noto-sans-tamil",
  subsets: ["tamil", "latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Glossary of Social Work in Tamil — சமூகப்பணி கலைச்சொல் அகராதி",
    template: "%s — Glossary of Social Work in Tamil",
  },
  description:
    "5,062 social work terms explained in Tamil and English. Search, browse A–Z, or read by category. Content by S. Rengasamy.",
  openGraph: {
    type: "website",
    siteName: "Glossary of Social Work in Tamil",
    locale: "ta_IN",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // The phone view is a full-screen app frame; letting it zoom out or pan
  // sideways would drag the fixed blue bar off the screen.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: APP_BAR_COLOR,
};

/**
 * Applies the stored theme and reading size before first paint, so neither the
 * colours nor the text size jump once the app's own scripts run.
 */
const themeScript = `(function(){try{
  var d = document.documentElement;
  var t = localStorage.getItem('glossary-theme');
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  d.setAttribute('data-theme', t);
  var s = parseFloat(localStorage.getItem('glossary-read-scale'));
  if (s >= 1 && s <= 2) d.style.setProperty('--app-read-scale', String(s));
}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={cx(
        literata.variable,
        notoTamil.variable,
        notoSansTamil.variable,
        plexMono.variable,
        "h-full antialiased",
      )}
      suppressHydrationWarning
    >
      <body className="app flex min-h-full flex-col bg-app-surface">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-app-accent focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        {/* One chrome at every width. A reader who opens a shared link on a
            laptop should recognise the app they were sent it from. */}
        <AppChrome version={APP_VERSION} />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
