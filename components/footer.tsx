// Global footer — Server Component. Minimal: legal + social + copyright.
// Legal routes (/imprint, /privacy, /terms) 404 until Phase 6. Acceptable.
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-raised border-t border-border-subtle">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Legal links */}
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { key: "legal.imprint", href: "/imprint" },
              { key: "legal.privacy", href: "/privacy" },
              { key: "legal.terms",   href: "/terms" },
            ].map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-text-tertiary text-[12px] font-normal transition-colors duration-100 hover:text-text-secondary"
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>

          {/* Social links — hrefs are placeholders until Phase 6 */}
          <div className="flex items-center gap-5">
            {[
              { key: "social.instagram", href: "#" },
              { key: "social.youtube",   href: "#" },
              { key: "social.facebook",  href: "#" },
            ].map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="text-text-tertiary text-[12px] font-normal transition-colors duration-100 hover:text-text-secondary"
              >
                {t(key as Parameters<typeof t>[0])}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-text-tertiary text-[12px] font-normal leading-[1.5] tracking-[-0.05px]">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
