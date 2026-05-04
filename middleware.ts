// next-intl middleware handles locale detection and prefix-based routing.
// Runs on all routes except static assets and Next.js internals.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
