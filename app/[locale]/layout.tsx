// Root layout for all locale-prefixed routes.
// Provides NextIntlClientProvider for client-side translations.
// Injects Inter and Playfair Display Italic via next/font as CSS variables.
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { routing } from "@/i18n/routing";
import "./globals.css";

// --font-inter-var is referenced by --font-inter in @theme (globals.css)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-var",
});

// Italic-only load — Playfair is used exclusively for italic accents in gold-500
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-playfair-var",
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
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
