// Blog listing — ISR (revalidate hourly; admin publish actions revalidate
// on demand). Rendered statically per locale via setRequestLocale.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BlogListing } from "@/components/blog/blog-listing";
import type { BlogLocale } from "@/lib/blog/types";

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://todasolutions.com";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteUrl}/${locale}/blog`,
      siteName: "TODA",
      locale,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/blog`,
      languages: {
        de: `${siteUrl}/de/blog`,
        en: `${siteUrl}/en/blog`,
        es: `${siteUrl}/es/blog`,
      },
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as BlogLocale)) notFound();
  setRequestLocale(locale);

  return <BlogListing locale={locale as BlogLocale} />;
}
