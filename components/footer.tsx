// Global footer — Server Component. Minimal: legal + social + copyright.
// Legal routes (/imprint, /privacy, /terms) 404 until Phase 6. Acceptable.
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TODA_SOCIAL_URLS } from "@/lib/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const tBlog = await getTranslations("blog");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-raised border-border-subtle border-t">
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Legal + site links. Blog lives here too — the header hides it on the
              smallest screens to make room for the CTA. */}
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { key: "legal.imprint", href: "/imprint" },
              { key: "legal.privacy", href: "/privacy" },
              // AGB hidden until /terms is live
            ].map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-text-tertiary hover:text-text-secondary text-[12px] font-normal transition-colors duration-100"
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            ))}
            <Link
              href="/blog"
              className="text-text-tertiary hover:text-text-secondary text-[12px] font-normal transition-colors duration-100"
            >
              {tBlog("nav")}
            </Link>
          </nav>

          {/* First-party social identity links, shared with Organization JSON-LD. */}
          <div className="flex items-center gap-5">
            {[
              { key: "social.instagram", href: TODA_SOCIAL_URLS.instagram },
              { key: "social.youtube", href: TODA_SOCIAL_URLS.youtube },
              { key: "social.facebook", href: TODA_SOCIAL_URLS.facebook },
            ].map(({ key, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-text-secondary text-[12px] font-normal transition-colors duration-100"
              >
                {t(key as Parameters<typeof t>[0])}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <p className="text-text-tertiary mt-6 text-[12px] leading-[1.5] font-normal tracking-[-0.05px]">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
