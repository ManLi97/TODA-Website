// Locale-specific metadata reused by Next metadata and the homepage entity graph.
// Keeping one source prevents the canonical page and its structured data from
// describing the product differently.
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
