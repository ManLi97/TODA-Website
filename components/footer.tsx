// Global footer — Server Component. Language switcher is structurally present but not yet wired
// to the current path (links go to locale home pages). Full path-aware switching comes in Phase 6.
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const LOCALES = ["de", "en", "es"] as const;
type SupportedLocale = (typeof LOCALES)[number];

export async function Footer() {
  const t = await getTranslations("footer");
  const locale = (await getLocale()) as SupportedLocale;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-raised border-t border-border-subtle">
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {/* Top row: brand + link columns */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_repeat(4,auto)] md:gap-16">
          {/* Brand block */}
          <div className="flex flex-col gap-4 max-w-xs">
            <Link
              href="/"
              className="text-text-primary font-semibold text-[16px] tracking-tight transition-opacity duration-100 hover:opacity-70 self-start"
            >
              TODA
            </Link>
            <p className="text-text-secondary text-[14px] font-normal leading-[1.47] tracking-[-0.1px]">
              {t("tagline")}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="#"
                className="text-text-tertiary text-[12px] font-normal transition-colors duration-100 hover:text-text-secondary"
              >
                {t("social.instagram")}
              </a>
              <a
                href="#"
                className="text-text-tertiary text-[12px] font-normal transition-colors duration-100 hover:text-text-secondary"
              >
                {t("social.linkedin")}
              </a>
            </div>
          </div>

          {/* Product column */}
          <div className="flex flex-col gap-4">
            <p className="text-text-primary text-[14px] font-semibold leading-[1.29] tracking-[-0.1px]">
              {t("product.heading")}
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { key: "product.features", href: "/#features" },
                { key: "product.pricing", href: "/#pricing" },
                { key: "product.changelog", href: "/changelog" },
                { key: "product.roadmap", href: "/roadmap" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-text-secondary text-[12px] font-normal leading-[1.5] transition-colors duration-100 hover:text-text-primary"
                  >
                    {t(key as Parameters<typeof t>[0])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div className="flex flex-col gap-4">
            <p className="text-text-primary text-[14px] font-semibold leading-[1.29] tracking-[-0.1px]">
              {t("company.heading")}
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { key: "company.about", href: "/about" },
                { key: "company.blog", href: "/blog" },
                { key: "company.careers", href: "/careers" },
                { key: "company.contact", href: "/contact" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-text-secondary text-[12px] font-normal leading-[1.5] transition-colors duration-100 hover:text-text-primary"
                  >
                    {t(key as Parameters<typeof t>[0])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div className="flex flex-col gap-4">
            <p className="text-text-primary text-[14px] font-semibold leading-[1.29] tracking-[-0.1px]">
              {t("legal.heading")}
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { key: "legal.imprint", href: "/imprint" },
                { key: "legal.privacy", href: "/privacy" },
                { key: "legal.terms", href: "/terms" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-text-secondary text-[12px] font-normal leading-[1.5] transition-colors duration-100 hover:text-text-primary"
                  >
                    {t(key as Parameters<typeof t>[0])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Language column — links to locale home pages (path-aware switching in Phase 6) */}
          <div className="flex flex-col gap-4">
            <p className="text-text-primary text-[14px] font-semibold leading-[1.29] tracking-[-0.1px]">
              {t("language.heading")}
            </p>
            <ul className="flex flex-col gap-3">
              {LOCALES.map((loc) => (
                <li key={loc}>
                  <Link
                    href="/"
                    locale={loc}
                    className={`text-[12px] font-normal leading-[1.5] transition-colors duration-100 ${
                      locale === loc
                        ? "text-text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {t(`language.${loc}` as Parameters<typeof t>[0])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar: copyright */}
        <div className="mt-16 pt-6 border-t border-border-subtle">
          <p className="text-text-tertiary text-[12px] font-normal leading-[1.5] tracking-[-0.05px]">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
