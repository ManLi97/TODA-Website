// GSC REST URL builders — pure, `server-only`-free so the node test runner can
// load them. Path parameters use encodeURIComponent (simple RFC-6570 expansion):
// `sc-domain:x` -> `sc-domain%3Ax`, `https://…` -> `https%3A%2F%2F…`.
const WEBMASTERS_V3 = "https://www.googleapis.com/webmasters/v3/sites";

// Sitemaps: submit / delete / get share this resource path.
export function sitemapSubmitUrl(siteUrl: string, feedpath: string): string {
  return `${WEBMASTERS_V3}/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`;
}
