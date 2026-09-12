import assert from "node:assert/strict";
import test from "node:test";
import { sitemapSubmitUrl } from "../lib/gsc/urls";

test("sitemapSubmitUrl encodes property and feedpath as single path segments", () => {
  assert.equal(
    sitemapSubmitUrl("sc-domain:todasolutions.com", "https://www.todasolutions.com/sitemap.xml"),
    "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Atodasolutions.com/sitemaps/https%3A%2F%2Fwww.todasolutions.com%2Fsitemap.xml"
  );
});
