import type { Metadata } from "next";
import { IBM_Plex_Mono, Literata, Noto_Serif_Tamil } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
};

/** Applies the stored theme before first paint so the page never flashes. */
const themeScript = `(function(){try{
  var t = localStorage.getItem('glossary-theme');
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
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
      className={`${literata.variable} ${notoTamil.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-violet focus:px-3 focus:py-2 focus:text-paper-raised"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
