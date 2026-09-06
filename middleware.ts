// next-intl middleware handles prefix-based locale routing. Composed so that
// every locale redirect it issues (307 by Next default) becomes a permanent
// 308 — unprefixed URLs must consolidate onto /de/... as the canonical target
// (Google keeps the source of a temporary redirect in the index). The 308
// copies all headers of the original redirect so nothing is lost.
// Runs on all routes except static assets, Next.js internals, and the
// non-localized /admin area (internal tool, English-only) and /api.
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  const location = response.headers.get("location");
  if (response.status === 307 && location) {
    return NextResponse.redirect(location, { status: 308, headers: response.headers });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|admin|api|.*\\..*).*)"],
};
