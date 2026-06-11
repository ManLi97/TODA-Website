// Global footer — Server Component. Minimal: legal + social + copyright.
// Legal routes (/imprint, /privacy, /terms) 404 until Phase 6. Acceptable.
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

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

          {/* Social links — hrefs are placeholders until Phase 6 */}
          <div className="flex items-center gap-5">
            {[
              { key: "social.instagram", href: "https://www.instagram.com/toda.tattoosolutions/" },
              { key: "social.youtube", href: "https://www.youtube.com/@TODATattooSolutions" },
              {
                key: "social.facebook",
                href: "https://www.facebook.com/profile.php?id=61587056530237",
              },
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
