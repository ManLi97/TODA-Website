// Locale-specific metadata reused by Next metadata and the homepage entity graph.
// Keeping one source prevents the canonical page and its structured data from
// describing the product differently.
import type { Metadata } from "next";
import { legalCanonical } from "@/lib/seo/alternates";

export const SITE_METADATA = {
  de: {
    title: "TODA – Die App für Tattoo Artists",
    description:
      "Anfragen, Termine & deine Buchungsseite – alles in einer App. Entwickelt von Tattoo Artists für Tattoo Artists. Monatlich kündbar, 24,99 €/Monat.",
    ogTitle: "TODA – Mehr Kunst. Weniger Chaos.",
    ogDescription:
      "Die App für selbstständige Tattoo Artists. Strukturierte Anfragen, Self-Service Buchung, eigene Buchungsseite.",
  },
  en: {
    title: "TODA – The App for Tattoo Artists",
    description:
      "Requests, bookings & your booking page – all in one app. Built by tattoo artists, for tattoo artists. Cancel anytime, €24.99/month.",
    ogTitle: "TODA – More Art. Less Chaos.",
    ogDescription:
      "The app for freelance tattoo artists. Structured requests, self-service booking, your own booking page.",
  },
  es: {
    title: "TODA – La App para Tatuadores",
    description:
      "Solicitudes, citas y tu página de reservas en una sola app. Creada por tatuadores, para tatuadores. Sin permanencia, 24,99 €/mes.",
    ogTitle: "TODA – Más Arte. Menos Caos.",
    ogDescription:
      "La app para tatuadores autónomos. Solicitudes estructuradas, reservas autogestionadas, tu propia página de reservas.",
  },
} as const;

export type SiteLocale = keyof typeof SITE_METADATA;

const BRAND_OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 628,
  alt: "TODA – Die App für Tattoo Artists",
};

/**
 * Metadata for the German-only legal pages (/imprint, /privacy). They render
 * identical content under every locale prefix, so all three consolidate onto
 * the DE canonical and emit no hreflang (URL contract D5). Title/description
 * are German on purpose — the documented exception to "all copy via next-intl".
 * Declared fully because a child `alternates`/`openGraph` replaces the layout's
 * object instead of merging into it.
 */
export function legalPageMetadata({
  path,
  title,
  description,
}: {
  path: "/imprint" | "/privacy";
  title: string;
  description: string;
}): Metadata {
  const canonical = legalCanonical(path);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "TODA",
      locale: "de",
      type: "website",
      images: [BRAND_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [BRAND_OG_IMAGE.url],
    },
  };
}
