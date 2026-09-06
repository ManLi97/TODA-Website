import assert from "node:assert/strict";
import test from "node:test";
import { routing } from "../i18n/routing";
import { articleAlternates, legalCanonical, localizedAlternates } from "../lib/seo/alternates";
import { SITE_URL } from "../lib/site";

test("localizedAlternates lists every locale plus x-default pointing at the German URL", () => {
  assert.deepEqual(localizedAlternates(""), {
    de: `${SITE_URL}/de`,
    es: `${SITE_URL}/es`,
    en: `${SITE_URL}/en`,
    "x-default": `${SITE_URL}/de`,
  });
  const category = localizedAlternates("/blog/category/marketing");
  assert.equal(Object.keys(category).length, routing.locales.length + 1);
  assert.equal(category["x-default"], `${SITE_URL}/de/blog/category/marketing`);
  for (const locale of routing.locales) {
    assert.equal(category[locale], `${SITE_URL}/${locale}/blog/category/marketing`);
  }
});

test("articleAlternates lists only published siblings and uses the German sibling as x-default", () => {
  const map = articleAlternates(
    { de: "vom-dachdecker-zum-tattoo-artist", en: "from-roofer-to-tattoo-artist" },
    "en",
    "from-roofer-to-tattoo-artist"
  );
  assert.deepEqual(map, {
    de: `${SITE_URL}/de/blog/vom-dachdecker-zum-tattoo-artist`,
    en: `${SITE_URL}/en/blog/from-roofer-to-tattoo-artist`,
    "x-default": `${SITE_URL}/de/blog/vom-dachdecker-zum-tattoo-artist`,
  });
  assert.equal("es" in map, false);
});

test("articleAlternates without a published German sibling falls back to the article's own URL", () => {
  const map = articleAlternates({ en: "english-only", es: "solo-espanol" }, "es", "solo-espanol");
  assert.deepEqual(map, {
    es: `${SITE_URL}/es/blog/solo-espanol`,
    en: `${SITE_URL}/en/blog/english-only`,
    "x-default": `${SITE_URL}/es/blog/solo-espanol`,
  });
});

test("articleAlternates for a single published translation is self plus x-default", () => {
  assert.deepEqual(articleAlternates({ de: "nur-deutsch" }, "de", "nur-deutsch"), {
    de: `${SITE_URL}/de/blog/nur-deutsch`,
    "x-default": `${SITE_URL}/de/blog/nur-deutsch`,
  });
});

test("legalCanonical always resolves to the German prefix", () => {
  assert.equal(legalCanonical("/imprint"), `${SITE_URL}/de/imprint`);
  assert.equal(legalCanonical("/privacy"), `${SITE_URL}/de/privacy`);
});
