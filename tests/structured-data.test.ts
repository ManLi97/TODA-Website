import assert from "node:assert/strict";
import test from "node:test";
import deMessages from "../messages/de.json";
import enMessages from "../messages/en.json";
import esMessages from "../messages/es.json";
import type { Author, BlogLocale } from "../lib/blog/types";
import { SITE_METADATA } from "../lib/seo/site-metadata";
import {
  ENTITY_IDS,
  articleEntityId,
  articleUrl,
  createArticleJsonLd,
  createHomepageJsonLd,
  homepageUrl,
  personEntityId,
  serializeJsonLd,
  videoEntityId,
  webpageEntityId,
  type JsonLdDocument,
  type JsonLdNode,
} from "../lib/seo/structured-data";
import { SITE_URL, TODA_MONTHLY_PRICE, TODA_PRICE_CURRENCY, TODA_SOCIAL_URLS } from "../lib/site";

const messages = {
  de: deMessages,
  es: esMessages,
  en: enMessages,
};

const monthlyPriceLabels = {
  de: "pro Monat",
  es: "al mes",
  en: "per month",
} as const;

function parse(document: JsonLdDocument): JsonLdDocument {
  return JSON.parse(serializeJsonLd(document)) as JsonLdDocument;
}

function nodeById(document: JsonLdDocument, id: string): JsonLdNode {
  const node = document["@graph"].find((candidate) => candidate["@id"] === id);
  assert.ok(node, `Missing JSON-LD node ${id}`);
  return node;
}

function referenceId(value: unknown): string {
  assert.ok(value && typeof value === "object" && "@id" in value, "Expected an @id reference");
  const id = (value as { "@id": unknown })["@id"];
  assert.ok(typeof id === "string");
  return id;
}

function assertUniqueNodeIds(document: JsonLdDocument): void {
  const ids = document["@graph"].map((node) => node["@id"]);
  assert.ok(ids.every((id) => typeof id === "string"));
  assert.equal(new Set(ids).size, ids.length);
}

for (const locale of ["de", "es", "en"] satisfies BlogLocale[]) {
  test(`homepage ${locale} emits the connected canonical entity graph`, () => {
    const document = parse(
      createHomepageJsonLd({
        locale,
        title: SITE_METADATA[locale].title,
        description: SITE_METADATA[locale].description,
      })
    );
    const canonicalUrl = homepageUrl(locale);
    const webpageId = webpageEntityId(canonicalUrl);

    assert.equal(document["@context"], "https://schema.org");
    assert.equal(document["@graph"].length, 6);
    assertUniqueNodeIds(document);

    const organization = nodeById(document, ENTITY_IDS.organization);
    const logo = nodeById(document, ENTITY_IDS.logo);
    const website = nodeById(document, ENTITY_IDS.website);
    const webpage = nodeById(document, webpageId);
    const software = nodeById(document, ENTITY_IDS.softwareApplication);
    const offer = nodeById(document, ENTITY_IDS.monthlyOffer);

    assert.equal(organization["@type"], "Organization");
    assert.equal(referenceId(organization.logo), ENTITY_IDS.logo);
    assert.equal(logo["@type"], "ImageObject");
    assert.equal(website["@type"], "WebSite");
    assert.equal(referenceId(website.publisher), ENTITY_IDS.organization);

    assert.equal(webpage["@type"], "WebPage");
    assert.equal(webpage.url, canonicalUrl);
    assert.equal(webpage.inLanguage, locale);
    assert.equal(webpage.name, SITE_METADATA[locale].title);
    assert.equal(webpage.description, SITE_METADATA[locale].description);
    assert.equal(referenceId(webpage.isPartOf), ENTITY_IDS.website);
    assert.equal(referenceId(webpage.mainEntity), ENTITY_IDS.softwareApplication);
    assert.deepEqual((webpage.about as unknown[]).map(referenceId), [
      ENTITY_IDS.organization,
      ENTITY_IDS.softwareApplication,
    ]);

    assert.equal(software["@type"], "SoftwareApplication");
    assert.equal(referenceId(software.publisher), ENTITY_IDS.organization);
    assert.equal(referenceId(software.mainEntityOfPage), webpageId);
    assert.equal(referenceId(software.offers), ENTITY_IDS.monthlyOffer);

    assert.equal(offer["@type"], "Offer");
    assert.equal(offer.url, `${canonicalUrl}#pricing`);
    assert.equal(offer.price, TODA_MONTHLY_PRICE);
    assert.equal(offer.priceCurrency, TODA_PRICE_CURRENCY);
    assert.equal(referenceId(offer.seller), ENTITY_IDS.organization);
    assert.equal(referenceId(offer.itemOffered), ENTITY_IDS.softwareApplication);
    assert.deepEqual(offer.priceSpecification, {
      "@type": "UnitPriceSpecification",
      price: TODA_MONTHLY_PRICE,
      priceCurrency: TODA_PRICE_CURRENCY,
      billingDuration: "P1M",
    });

    const visiblePrice = messages[locale].home.pricing.price
      .replace(",", ".")
      .match(/\d+\.\d{2}/)?.[0];
    assert.equal(visiblePrice, TODA_MONTHLY_PRICE);
    assert.equal(messages[locale].home.pricing.pricePeriod, monthlyPriceLabels[locale]);
  });
}

test("Organization uses only the centralized first-party legal and identity facts", () => {
  const document = parse(
    createHomepageJsonLd({
      locale: "de",
      title: SITE_METADATA.de.title,
      description: SITE_METADATA.de.description,
    })
  );
  const organization = nodeById(document, ENTITY_IDS.organization);
  const logo = nodeById(document, ENTITY_IDS.logo);

  assert.equal(organization.name, "TODA Tattoo Solutions");
  assert.equal(organization.legalName, "TODA Tattoo Solutions S.L.");
  assert.equal(organization.url, SITE_URL);
  assert.equal(organization.email, "manuel@todasolutions.com");
  assert.equal(organization.taxID, "B26574699");
  assert.deepEqual(organization.address, {
    "@type": "PostalAddress",
    streetAddress: "Carrer de Miquel Barceló 2-4, Bloque A2 Apt. 201",
    postalCode: "07180",
    addressLocality: "Calvià",
    addressRegion: "Illes Balears",
    addressCountry: "ES",
  });
  assert.deepEqual(organization.sameAs, Object.values(TODA_SOCIAL_URLS));
  assert.equal(logo.url, `${SITE_URL}/toda-app-icon.svg`);
  assert.equal(logo.width, 1024);
  assert.equal(logo.height, 1024);
});

test("serializer neutralizes script boundaries and JavaScript line separators", () => {
  const payload = `Close </script><script>alert(1)</script>\u2028next\u2029line`;
  const document = createHomepageJsonLd({
    locale: "en",
    title: "Unsafe title",
    description: payload,
  });
  const serialized = serializeJsonLd(document);

  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("<script>"), false);
  assert.equal(serialized.includes("\u2028"), false);
  assert.equal(serialized.includes("\u2029"), false);
  assert.match(serialized, /\\u003c\/script>/);
  assert.match(serialized, /\\u2028/);
  assert.match(serialized, /\\u2029/);

  const parsed = JSON.parse(serialized) as JsonLdDocument;
  assert.equal(nodeById(parsed, ENTITY_IDS.softwareApplication).description, payload);
});

test("person-authored article links canonical entities without inventing affiliation", () => {
  const author: Author = {
    name: "Ada Artist",
    slug: "ada-artist",
    slogan: { en: "Tattoo artist" },
    avatarPath: "ada/avatar.jpg",
    socials: [
      { platform: "website", url: "https://ada.example/about" },
      { platform: "instagram", url: "https://instagram.com/ada" },
      { platform: "youtube", url: "https://instagram.com/ada" },
      { platform: "email", url: "mailto:ada@example.com" },
      { platform: "x", url: "javascript:alert(1)" },
      { platform: "facebook", url: "not-a-url" },
    ],
  };
  const canonicalUrl = articleUrl("en", "safe-schema");
  const webpageId = webpageEntityId(canonicalUrl);
  const currentArticleId = articleEntityId(canonicalUrl);
  const currentPersonId = personEntityId(author.slug);
  const currentVideoId = videoEntityId(canonicalUrl);
  const document = parse(
    createArticleJsonLd({
      locale: "en",
      slug: "safe-schema",
      title: "A structured article",
      description: "Article description",
      publishedAt: "2026-08-01T10:00:00.000Z",
      updatedAt: "2026-08-02T11:00:00.000Z",
      coverImageUrl: "https://images.example/cover.jpg",
      author,
      authorImageUrl: "https://images.example/ada.jpg",
      video: {
        youtubeId: "abc123",
        startSeconds: 42.9,
        publishedAt: "2026-07-31T09:00:00.000Z",
      },
    })
  );

  assertUniqueNodeIds(document);
  const website = nodeById(document, ENTITY_IDS.website);
  const webpage = nodeById(document, webpageId);
  const article = nodeById(document, currentArticleId);
  const person = nodeById(document, currentPersonId);
  const video = nodeById(document, currentVideoId);

  assert.equal(referenceId(website.publisher), ENTITY_IDS.organization);
  assert.equal(webpage.url, canonicalUrl);
  assert.equal(webpage.inLanguage, "en");
  assert.equal(referenceId(webpage.isPartOf), ENTITY_IDS.website);
  assert.equal(referenceId(webpage.mainEntity), currentArticleId);

  assert.equal(article["@type"], "Article");
  assert.equal(article.url, canonicalUrl);
  assert.equal(article.datePublished, "2026-08-01T10:00:00.000Z");
  assert.equal(article.dateModified, "2026-08-02T11:00:00.000Z");
  assert.deepEqual(article.image, ["https://images.example/cover.jpg"]);
  assert.equal(referenceId(article.mainEntityOfPage), webpageId);
  assert.equal(referenceId(article.isPartOf), ENTITY_IDS.website);
  assert.equal(referenceId(article.publisher), ENTITY_IDS.organization);
  assert.equal(referenceId(article.author), currentPersonId);
  assert.equal(referenceId(article.video), currentVideoId);

  assert.equal(person["@type"], "Person");
  assert.equal(person.url, "https://ada.example/about");
  assert.equal(person.image, "https://images.example/ada.jpg");
  assert.deepEqual(person.sameAs, ["https://ada.example/about", "https://instagram.com/ada"]);
  assert.equal("worksFor" in person, false);
  assert.equal("affiliation" in person, false);
  assert.equal("memberOf" in person, false);

  assert.equal(video["@type"], "VideoObject");
  assert.equal(video.embedUrl, "https://www.youtube-nocookie.com/embed/abc123?start=42");
  assert.equal(video.uploadDate, "2026-07-31T09:00:00.000Z");
  assert.equal(referenceId(video.publisher), ENTITY_IDS.organization);
  assert.equal(referenceId(video.isPartOf), currentArticleId);
  assert.equal("startOffset" in video, false);
});

test("the current toda-team author resolves to Organization instead of Person", () => {
  const author: Author = {
    name: "Dein TODA Team",
    slug: "toda-team",
    slogan: { de: "TODA" },
    avatarPath: "team/avatar.jpg",
    socials: [{ platform: "instagram", url: TODA_SOCIAL_URLS.instagram }],
  };
  const canonicalUrl = articleUrl("de", "team-article");
  const document = parse(
    createArticleJsonLd({
      locale: "de",
      slug: "team-article",
      title: "Team article",
      description: "Article description",
      publishedAt: "2026-08-01T10:00:00.000Z",
      updatedAt: "2026-08-01T10:00:00.000Z",
      coverImageUrl: null,
      author,
      authorImageUrl: "https://images.example/team.jpg",
      video: null,
    })
  );
  const article = nodeById(document, articleEntityId(canonicalUrl));

  assert.equal(referenceId(article.author), ENTITY_IDS.organization);
  assert.equal(document["@graph"].filter((node) => node["@type"] === "Organization").length, 1);
  assert.equal(
    document["@graph"].some((node) => node["@type"] === "Person"),
    false
  );
  assert.equal(
    document["@graph"].some((node) => node["@type"] === "VideoObject"),
    false
  );
});
