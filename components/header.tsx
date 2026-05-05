"use client";

// Global nav — sticky, glass-blur, scroll-aware (hides on scroll down, reappears on scroll up).
// Client Component: needs scroll events, mobile menu state, locale switching, and useTranslations.
import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

type NavKey = "features" | "pricing" | "blog" | "about";

const NAV_LINKS: { key: NavKey; href: string }[] = [
  { key: "features", href: "/#features" },
  { key: "pricing", href: "/#pricing" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
];

const LOCALES = ["de", "en", "es"] as const;
type SupportedLocale = (typeof LOCALES)[number];

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Hide on scroll down past nav height; reveal on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (delta > 8 && currentY > 56) {
        setVisible(false);
        setMenuOpen(false);
      } else if (delta < -8) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const switchLocale = (next: SupportedLocale) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Main bar */}
      <div className="h-14 bg-surface-base/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1440px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-text-primary font-semibold text-[16px] tracking-tight shrink-0 transition-opacity duration-100 hover:opacity-70 active:opacity-100"
          >
            TODA
          </Link>

          {/* Desktop nav — centered via absolute positioning */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
          >
            {NAV_LINKS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-text-secondary text-[14px] font-normal leading-none transition-colors duration-100 hover:text-text-primary"
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Desktop right cluster */}
          <div className="hidden md:flex items-center gap-5">
            {/* Locale switcher */}
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

            {/* CTA */}
            <Link
              href="/#contact"
              className="bg-gold-500 text-surface-base font-semibold text-[16px] px-7 py-3 rounded-[980px] transition-colors duration-150 hover:bg-gold-400 active:scale-[0.97] active:bg-gold-600"
            >
              {t("cta")}
            </Link>
          </div>

          {/* Mobile right cluster */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/#contact"
              className="bg-gold-500 text-surface-base font-semibold text-[14px] px-5 py-2 rounded-[980px] transition-colors duration-150 hover:bg-gold-400 active:scale-[0.97] active:bg-gold-600"
            >
              {t("cta")}
            </Link>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
              className="text-text-secondary hover:text-text-primary transition-colors duration-100 p-1 -mr-1"
            >
              {menuOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 4l12 12M16 4L4 16" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M3 5h14M3 10h14M3 15h14" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-base/95 backdrop-blur-md border-b border-border-subtle">
          <nav
            aria-label="Mobile navigation"
            className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col gap-1"
          >
            {NAV_LINKS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-text-secondary text-[17px] font-normal leading-[1.47] py-2 transition-colors duration-100 hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {t(key)}
              </Link>
            ))}

            {/* Locale switcher in mobile menu */}
            <div className="flex items-center gap-4 pt-4 mt-2 border-t border-border-subtle">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    switchLocale(loc);
                    setMenuOpen(false);
                  }}
                  className={`text-[14px] font-normal uppercase tracking-wide transition-colors duration-100 ${
                    locale === loc
                      ? "text-text-primary"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
