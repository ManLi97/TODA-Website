"use client";

// Global header — fixed glass strip: logo left, language switcher right.
// Client Component: needs useRouter for locale switching.
import { useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

const LOCALES = ["de", "en", "es"] as const;
type SupportedLocale = (typeof LOCALES)[number];

export function Header() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: SupportedLocale) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        background: "var(--glass-tint)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        borderBottom: "var(--glass-border-gold)",
      }}
    >
      <div className="h-14 max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 transition-opacity duration-100 hover:opacity-70 active:opacity-100"
        >
          <img
            src="/TODA-LOGO.svg"
            alt="TODA"
            width={74}
            height={36}
            className="block"
          />
        </Link>

        {/* Language switcher */}
        <div className="flex items-center gap-2" aria-label="Language switcher">
          {LOCALES.map((loc, i) => (
            <span key={loc} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-border-subtle text-[12px] select-none">|</span>
              )}
              <button
                onClick={() => switchLocale(loc)}
                className={`text-[12px] font-normal uppercase tracking-wide transition-colors duration-100 ${
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
    </header>
  );
}
