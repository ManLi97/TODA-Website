"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Tags, Users } from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/authors", label: "Authors", icon: Users },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="hidden items-center gap-1 md:flex">
      {ADMIN_NAV_ITEMS.map(({ href, label }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`focus-visible:ring-gold-500/40 inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
              active
                ? "bg-surface-hover text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin mobile"
      className="border-border bg-surface-alt/95 fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div
        className="mx-auto grid h-16 max-w-md px-2"
        style={{ gridTemplateColumns: `repeat(${ADMIN_NAV_ITEMS.length}, minmax(0, 1fr))` }}
      >
        {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`focus-visible:ring-gold-500/40 relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.6875rem] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                active ? "text-gold-200" : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              <span className="truncate">{label}</span>
              {active && (
                <span
                  aria-hidden="true"
                  className="bg-gold-400 absolute inset-x-5 top-0 h-0.5 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
