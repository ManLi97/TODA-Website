// Root layout for all locale-prefixed routes.
// Provides NextIntlClientProvider for client-side translations.
// Injects Inter and Playfair Display Italic via next/font as CSS variables.
// Scroll is plain smooth scroll on <html> — no scroll-snap, no JS scroll provider.
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/seo/alternates";
import { SITE_METADATA, type SiteLocale } from "@/lib/seo/site-metadata";
import { SITE_URL } from "@/lib/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { AnalyticsEngagement } from "@/components/analytics-engagement";
import "./globals.css";

// Inter — DS type ladder uses three weights only: 200 (thin), 400 (regular),
// 600 (semibold). Loading them as explicit weights gives static instances
// instead of the variable font, which is fine for this fixed palette and
// produces a smaller total payload than the full variable axis.
// --font-inter-var feeds --font-sans / --font-inter in @theme (globals.css).
const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "400", "600"],
  variable: "--font-inter-var",
  display: "swap",
});

// Playfair Display — italic 400 only. Used exactly once on the site: the
// "Weniger Chaos" accent span in the Hero headline. Do not extend this load.
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-playfair-var",
  display: "swap",
});

const siteUrl = SITE_URL;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const c = SITE_METADATA[locale as SiteLocale] ?? SITE_METADATA.de;

  return {
    metadataBase: new URL(siteUrl),
    title: c.title,
    description: c.description,
    icons: {
      icon: [{ url: "/toda-app-icon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      title: c.ogTitle,
      description: c.ogDescription,
      url: `${siteUrl}/${locale}`,
      siteName: "TODA",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 628,
          alt: "TODA – Die App für Tattoo Artists",
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: c.ogTitle,
      description: c.ogDescription,
      images: ["/og-image.png"],
    },
    // Home alternates (D2): de/en/es + x-default (German). Child routes that
    // export their own `alternates` replace this object entirely (no deep merge).
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: localizedAlternates(""),
    },
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Prebuild the three locale shells so statically-opted pages (blog, ISR) can
// render at build time. Pages that don't call setRequestLocale stay dynamic.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Enables static rendering — must precede any next-intl API call (getMessages).
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
        <AnalyticsBeacon />
        <AnalyticsEngagement />
      </body>
    </html>
  );
}
