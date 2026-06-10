// next-intl middleware handles locale detection and prefix-based routing.
// Runs on all routes except static assets, Next.js internals, and the
// non-localized /admin area (internal tool, English-only) and /api.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!_next|_vercel|admin|api|.*\\..*).*)"],
};
