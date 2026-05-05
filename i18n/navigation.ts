// Locale-aware navigation helpers — use these instead of next/link for internal routes.
// Link adds the locale prefix automatically; useRouter/usePathname strip it for locale switching.
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
