// Root layout for all locale-prefixed routes.
// Provides NextIntlClientProvider for client-side translations.
// Injects Inter and Playfair Display Italic via next/font as CSS variables.
// Scroll is handled by native CSS scroll-snap on <html> — no JS scroll provider.
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
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

export const metadata: Metadata = {
  title: "TODA Solutions",
  description: "TODA Solutions — Marketing Website",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {/* Phase 5a — fixed ambient gold glow, sits behind all content */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -1,
            pointerEvents: "none",
            background: "var(--grad-ambient)",
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
