"use client";

// One-time language hint (replaces automatic locale redirects — decision 2 of
// docs/seo/url-contract.md). After mount it compares the device language
// (navigator.languages, first supported primary subtag) with the page locale;
// if they differ and no choice is remembered, a narrow glass strip offers the
// same path in the device language. Renders nothing on the server and on the
// first client paint, so crawlers and curl never see it (no cloaking risk).
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { readLocaleHint, writeLocaleHint } from "@/lib/locale-hint";

type SupportedLocale = (typeof routing.locales)[number];

function deviceLocale(): SupportedLocale | null {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of candidates) {
    const primary = tag?.toLowerCase().split("-")[0];
    if (routing.locales.includes(primary as SupportedLocale)) return primary as SupportedLocale;
  }
  return null;
}

export function LocaleHint() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("localeHint");
  const [target, setTarget] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    if (readLocaleHint()) return;
    const device = deviceLocale();
    if (device && device !== locale) setTarget(device);
  }, [locale]);

  if (!target) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="text-text-secondary flex max-w-full items-center gap-3 rounded-[980px] py-2 pr-2 pl-4 text-[13px] shadow-lg"
        style={{
          pointerEvents: "auto",
          background: "var(--glass-tint)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "var(--glass-border-gold)",
        }}
      >
        <span>{t(`${target}.text`)}</span>
        <Link
          href={pathname}
          locale={target}
          onClick={() => writeLocaleHint(`chosen:${target}`)}
          className="text-gold-500 hover:text-gold-400 shrink-0 font-semibold whitespace-nowrap transition-colors duration-150"
        >
          {t(`${target}.cta`)}
        </Link>
        <button
          type="button"
          onClick={() => {
            writeLocaleHint("dismissed");
            setTarget(null);
          }}
          aria-label={t(`${target}.dismiss`)}
          className="hover:text-text-primary flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}
