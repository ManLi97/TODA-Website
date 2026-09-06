// Category-filtered blog listing — path-based (not searchParams) so the page
// stays statically renderable and each category gets a crawlable URL.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { localizedAlternates } from "@/lib/seo/alternates";
import { BlogListing } from "@/components/blog/blog-listing";
import { JsonLd } from "@/components/json-ld";
import { createCategoryJsonLd } from "@/lib/seo/structured-data";
import { getCategories } from "@/lib/blog/queries";
import { categoryName } from "@/lib/blog/format";
import type { BlogLocale } from "@/lib/blog/types";

export const revalidate = 3600;
export const dynamicParams = true;

const siteUrl = SITE_URL;

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return routing.locales.flatMap((locale) =>
    categories.map((category) => ({ locale, category: category.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return {};

  const t = await getTranslations({ locale, namespace: "blog" });
  const name = categoryName(category.name, locale as BlogLocale);
  const path = `/blog/category/${categorySlug}`;

  const title = `${name} – ${t("metaTitle")}`;
  const description = t("metaDescription");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}${path}`,
      siteName: "TODA",
      locale,
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: localizedAlternates(path),
    },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { locale: rawLocale, category: categorySlug } = await params;
  if (!routing.locales.includes(rawLocale as BlogLocale)) notFound();
  const locale = rawLocale as BlogLocale;
  setRequestLocale(locale);

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const name = categoryName(category.name, locale);
  const jsonLd = createCategoryJsonLd({
    locale,
    categorySlug,
    categoryName: name,
    blogLabel: t("nav"),
    title: `${name} – ${t("metaTitle")}`,
    description: t("metaDescription"),
  });

  return (
    <>
      <JsonLd document={jsonLd} />
      <BlogListing locale={locale} activeCategorySlug={categorySlug} />
    </>
  );
}
