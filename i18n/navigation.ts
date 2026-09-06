// Locale-aware navigation helpers — use these instead of next/link for internal routes.
// Link adds the locale prefix automatically; useRouter/usePathname strip it for locale switching.
// permanentRedirect (308) is the only redirect for slug healing — see docs/seo/url-contract.md.
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, permanentRedirect, redirect, usePathname, useRouter } =
  createNavigation(routing);
