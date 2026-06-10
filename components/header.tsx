"use client";

// Global header — fixed glass strip: logo left, blog link + language switcher right.
// Client Component: needs useRouter for locale switching.
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

const LOCALES = ["de", "en", "es"] as const;
type SupportedLocale = (typeof LOCALES)[number];

export function Header() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("blog");
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
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 transition-opacity duration-100 hover:opacity-70 active:opacity-100"
        >
          <img src="/TODA-LOGO.svg" alt="TODA" width={74} height={36} className="block" />
        </Link>

        <div className="flex items-center gap-6">
          {/* Blog */}
          <Link
            href="/blog"
            className={`text-[12px] font-normal tracking-wide uppercase transition-colors duration-100 ${
              onBlog ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t("nav")}
          </Link>

          {/* Language switcher */}
          <div className="flex items-center gap-2" aria-label="Language switcher">
            {LOCALES.map((loc, i) => (
              <span key={loc} className="flex items-center gap-2">
                {i > 0 && <span className="text-border-subtle text-[12px] select-none">|</span>}
                <button
                  onClick={() => switchLocale(loc)}
                  className={`text-[12px] font-normal tracking-wide uppercase transition-colors duration-100 ${
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
        </div>
      </div>
    </header>
  );
}
