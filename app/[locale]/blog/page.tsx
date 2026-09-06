// Blog listing — ISR (revalidate hourly; admin publish actions revalidate
// on demand). Rendered statically per locale via setRequestLocale.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { localizedAlternates } from "@/lib/seo/alternates";
import { BlogListing } from "@/components/blog/blog-listing";
import { JsonLd } from "@/components/json-ld";
import { createBlogListingJsonLd } from "@/lib/seo/structured-data";
import type { BlogLocale } from "@/lib/blog/types";

export const revalidate = 3600;

const siteUrl = SITE_URL;

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
      languages: localizedAlternates("/blog"),
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  if (!routing.locales.includes(rawLocale as BlogLocale)) notFound();
  const locale = rawLocale as BlogLocale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const jsonLd = createBlogListingJsonLd({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
  });

  return (
    <>
      <JsonLd document={jsonLd} />
      <BlogListing locale={locale} />
    </>
  );
}
