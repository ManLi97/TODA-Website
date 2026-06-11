"use client";

// Global header — fixed glass strip: logo left; section anchors (md+), blog link,
// language switcher and the primary CTA right.
// Client Component: needs useRouter for locale switching.
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { ONBOARDING_URL } from "@/lib/site";

const LOCALES = ["de", "en", "es"] as const;
type SupportedLocale = (typeof LOCALES)[number];

// Home-page section anchors. Linking "/#hash" (not "#hash") so they also work
// from /blog — next-intl prefixes the locale, Next scrolls to the hash on arrival.
const SECTION_ANCHORS = [
  { key: "features", hash: "features" },
  { key: "pricing", hash: "pricing" },
  { key: "faq", hash: "faq" },
] as const;

export function Header() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("blog");
  const tNav = useTranslations("home.nav");
  const onBlog = pathname.startsWith("/blog");

  const switchLocale = (next: SupportedLocale) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        background: "var(--glass-tint)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        borderBottom: "var(--glass-border-gold)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 transition-opacity duration-100 hover:opacity-70 active:opacity-100"
        >
          <img src="/TODA-LOGO.svg" alt="TODA" width={74} height={36} className="block" />
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Section anchors — desktop/tablet only */}
          <nav aria-label="Sections" className="hidden items-center gap-5 md:flex">
            {SECTION_ANCHORS.map(({ key, hash }) => (
              <Link
                key={key}
                href={`/#${hash}`}
                className="text-text-tertiary hover:text-text-secondary px-1 py-2 text-[12px] font-normal tracking-wide uppercase transition-colors duration-100"
              >
                {tNav(key)}
              </Link>
            ))}
          </nav>

          {/* Blog — hidden on the smallest screens to make room for the CTA */}
          <Link
            href="/blog"
            className={`hidden px-1 py-2 text-[12px] font-normal tracking-wide uppercase transition-colors duration-100 sm:inline-block ${
              onBlog ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t("nav")}
          </Link>

          {/* Language switcher */}
          <div className="flex items-center gap-1" aria-label="Language switcher">
            {LOCALES.map((loc, i) => (
              <span key={loc} className="flex items-center gap-1">
                {i > 0 && <span className="text-border-subtle text-[12px] select-none">|</span>}
                <button
                  onClick={() => switchLocale(loc)}
                  aria-current={locale === loc ? "true" : undefined}
                  className={`px-1.5 py-2 text-[12px] font-normal tracking-wide uppercase transition-colors duration-100 ${
                    locale === loc
                      ? "text-text-primary"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {loc}
                </button>
              </span>
            ))}
          </div>

          {/* Primary CTA — the one gold action in the chrome, on every viewport */}
          <a
            href={ONBOARDING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gold-500 text-surface-base hover:bg-gold-400 active:bg-gold-600 focus-visible:outline-gold-400 inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center rounded-[980px] px-4 py-1.5 text-[12px] font-semibold tracking-wide uppercase transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {tNav("cta")}
          </a>
        </div>
      </div>
    </header>
  );
}
