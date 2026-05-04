// Defines supported locales and routing strategy for next-intl.
// localePrefix "always" ensures /de/ is always in the URL — root / redirects to /de/.
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "es", "en"],
  defaultLocale: "de",
  localePrefix: "always",
});
