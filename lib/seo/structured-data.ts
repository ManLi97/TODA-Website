import { routing } from "@/i18n/routing";
import type { Author, BlogLocale } from "@/lib/blog/types";
import { SITE_URL, TODA_MONTHLY_PRICE, TODA_PRICE_CURRENCY, TODA_SOCIAL_URLS } from "@/lib/site";

export type JsonLdNode = {
  "@type": string;
  "@id"?: string;
  [property: string]: unknown;
};

export type JsonLdDocument = {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
};

export const ENTITY_IDS = {
  organization: `${SITE_URL}/#organization`,
  logo: `${SITE_URL}/#logo`,
  website: `${SITE_URL}/#website`,
  softwareApplication: `${SITE_URL}/#software-application`,
  monthlyOffer: `${SITE_URL}/#monthly-offer`,
} as const;

export const TODA_TEAM_AUTHOR_SLUG = "toda-team";

function reference(id: string) {
  return { "@id": id };
}

export function homepageUrl(locale: BlogLocale): string {
  return `${SITE_URL}/${locale}`;
}

export function articleUrl(locale: BlogLocale, slug: string): string {
  return `${SITE_URL}/${locale}/blog/${slug}`;
}

export function webpageEntityId(canonicalUrl: string): string {
  return `${canonicalUrl}#webpage`;
}

export function articleEntityId(canonicalUrl: string): string {
  return `${canonicalUrl}#article`;
}

export function videoEntityId(canonicalUrl: string): string {
  return `${canonicalUrl}#video`;
}

export function personEntityId(slug: string): string {
  return `${SITE_URL}/#person-${encodeURIComponent(slug.trim())}`;
}

function createOrganizationNode(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ENTITY_IDS.organization,
    name: "TODA Tattoo Solutions",
    alternateName: "TODA",
    legalName: "TODA Tattoo Solutions S.L.",
    url: SITE_URL,
    logo: reference(ENTITY_IDS.logo),
    email: "manuel@todasolutions.com",
    taxID: "B26574699",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carrer de Miquel Barceló 2-4, Bloque A2 Apt. 201",
      postalCode: "07180",
      addressLocality: "Calvià",
      addressRegion: "Illes Balears",
      addressCountry: "ES",
    },
    sameAs: Object.values(TODA_SOCIAL_URLS),
  };
}

function createLogoNode(): JsonLdNode {
  const logoUrl = `${SITE_URL}/toda-app-icon.svg`;
  return {
    "@type": "ImageObject",
    "@id": ENTITY_IDS.logo,
    url: logoUrl,
    contentUrl: logoUrl,
    width: 1024,
    height: 1024,
    caption: "TODA",
  };
}

function createWebsiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": ENTITY_IDS.website,
    name: "TODA",
    alternateName: "TODA Tattoo Solutions",
    url: SITE_URL,
    publisher: reference(ENTITY_IDS.organization),
    inLanguage: [...routing.locales],
  };
}

function createBaseNodes(): JsonLdNode[] {
  return [createOrganizationNode(), createLogoNode(), createWebsiteNode()];
}

export function createHomepageJsonLd({
  locale,
  title,
  description,
}: {
  locale: BlogLocale;
  title: string;
  description: string;
}): JsonLdDocument {
  const canonicalUrl = homepageUrl(locale);
  const webpageId = webpageEntityId(canonicalUrl);

  const webpage: JsonLdNode = {
    "@type": "WebPage",
    "@id": webpageId,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: reference(ENTITY_IDS.website),
    about: [reference(ENTITY_IDS.organization), reference(ENTITY_IDS.softwareApplication)],
    mainEntity: reference(ENTITY_IDS.softwareApplication),
  };

  const softwareApplication: JsonLdNode = {
    "@type": "SoftwareApplication",
    "@id": ENTITY_IDS.softwareApplication,
    name: "TODA Tattoo Solutions",
    alternateName: "TODA",
    url: SITE_URL,
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    publisher: reference(ENTITY_IDS.organization),
    mainEntityOfPage: reference(webpageId),
    offers: reference(ENTITY_IDS.monthlyOffer),
  };

  const offer: JsonLdNode = {
    "@type": "Offer",
    "@id": ENTITY_IDS.monthlyOffer,
    url: `${canonicalUrl}#pricing`,
    price: TODA_MONTHLY_PRICE,
    priceCurrency: TODA_PRICE_CURRENCY,
    seller: reference(ENTITY_IDS.organization),
    itemOffered: reference(ENTITY_IDS.softwareApplication),
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: TODA_MONTHLY_PRICE,
      priceCurrency: TODA_PRICE_CURRENCY,
      billingDuration: "P1M",
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [...createBaseNodes(), webpage, softwareApplication, offer],
  };
}

function publicHttpUrl(value: string): string | null {
  const candidate = value.trim();
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? candidate : null;
  } catch {
    return null;
  }
}

function createPersonNode(author: Author, authorImageUrl: string | null): JsonLdNode {
  const identityUrls = [
    ...new Set(
      author.socials.flatMap((social) => {
        if (social.platform === "email") return [];
        const url = publicHttpUrl(social.url);
        return url ? [url] : [];
      })
    ),
  ];
  const websiteUrl = author.socials.find((social) => social.platform === "website")?.url;
  const publicWebsiteUrl = websiteUrl ? publicHttpUrl(websiteUrl) : null;

  return {
    "@type": "Person",
    "@id": personEntityId(author.slug),
    name: author.name,
    ...(publicWebsiteUrl && { url: publicWebsiteUrl }),
    ...(authorImageUrl && { image: authorImageUrl }),
    ...(identityUrls.length > 0 && { sameAs: identityUrls }),
  };
}

function youtubeEmbedUrl(youtubeId: string, startSeconds: number | null): string {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}`);
  if (startSeconds != null && Number.isFinite(startSeconds) && startSeconds >= 0) {
    url.searchParams.set("start", String(Math.floor(startSeconds)));
  }
  return url.toString();
}

export function createArticleJsonLd({
  locale,
  slug,
  title,
  description,
  publishedAt,
  updatedAt,
  coverImageUrl,
  author,
  authorImageUrl,
  video,
}: {
  locale: BlogLocale;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  coverImageUrl: string | null;
  author: Author | null;
  authorImageUrl: string | null;
  video: {
    youtubeId: string;
    startSeconds: number | null;
    publishedAt: string | null;
  } | null;
}): JsonLdDocument {
  const canonicalUrl = articleUrl(locale, slug);
  const webpageId = webpageEntityId(canonicalUrl);
  const articleId = articleEntityId(canonicalUrl);
  const authorIsOrganization = !author || author.slug === TODA_TEAM_AUTHOR_SLUG;
  const authorId = authorIsOrganization ? ENTITY_IDS.organization : personEntityId(author.slug);
  const currentVideoId = video ? videoEntityId(canonicalUrl) : null;

  const webpage: JsonLdNode = {
    "@type": "WebPage",
    "@id": webpageId,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: reference(ENTITY_IDS.website),
    mainEntity: reference(articleId),
  };

  const article: JsonLdNode = {
    "@type": "Article",
    "@id": articleId,
    url: canonicalUrl,
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt,
    inLanguage: locale,
    mainEntityOfPage: reference(webpageId),
    isPartOf: reference(ENTITY_IDS.website),
    author: reference(authorId),
    publisher: reference(ENTITY_IDS.organization),
    ...(coverImageUrl && { image: [coverImageUrl] }),
    ...(currentVideoId && { video: reference(currentVideoId) }),
  };

  const person = author && !authorIsOrganization ? createPersonNode(author, authorImageUrl) : null;
  const videoObject: JsonLdNode | null = video
    ? {
        "@type": "VideoObject",
        "@id": currentVideoId!,
        name: title,
        description,
        thumbnailUrl: `https://i.ytimg.com/vi/${encodeURIComponent(video.youtubeId)}/hqdefault.jpg`,
        embedUrl: youtubeEmbedUrl(video.youtubeId, video.startSeconds),
        publisher: reference(ENTITY_IDS.organization),
        isPartOf: reference(articleId),
        ...(video.publishedAt && { uploadDate: video.publishedAt }),
      }
    : null;

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...createBaseNodes(),
      webpage,
      article,
      ...(person ? [person] : []),
      ...(videoObject ? [videoObject] : []),
    ],
  };
}

export function serializeJsonLd(document: JsonLdDocument): string {
  return JSON.stringify(document)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
