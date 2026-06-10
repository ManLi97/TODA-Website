// Blog article — ISR. notFound() when no PUBLISHED translation exists for
// this locale (per-locale publish). hreflang alternates and JSON-LD are
// computed from published sibling translations only — never link a draft.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PageSection } from "@/components/page-section";
import { SectionHeader } from "@/components/section-header";
import { Animate } from "@/components/animate";
import { ArticleHeader } from "@/components/blog/article-header";
import { PostGrid } from "@/components/blog/post-grid";
import { ReadingProgress } from "@/components/blog/reading-progress";
import {
  coverImageUrl,
  getPostBySlug,
  getPublishedAlternates,
  getPublishedPosts,
  getRelatedPosts,
} from "@/lib/blog/queries";
import { renderMarkdown } from "@/lib/blog/markdown";
import { formatDate } from "@/lib/blog/format";
import type { BlogLocale } from "@/lib/blog/types";

export const revalidate = 3600;
export const dynamicParams = true;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://todasolutions.com";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const perLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const posts = await getPublishedPosts(locale);
      return posts.map((post) => ({ locale, slug: post.slug }));
    })
  );
  return perLocale.flat();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(locale as BlogLocale, slug);
  if (!post) return {};

  const alternates = await getPublishedAlternates(post.postId);
  const cover = coverImageUrl(post.coverImagePath);
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;

  const languages: Record<string, string> = {};
  for (const [altLocale, altSlug] of Object.entries(alternates)) {
    languages[altLocale] = `${siteUrl}/${altLocale}/blog/${altSlug}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/blog/${slug}`,
      siteName: "TODA",
      locale,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      ...(cover && { images: [{ url: cover, width: 1200, height: 675, alt: post.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(cover && { images: [cover] }),
    },
    alternates: {
      canonical: `${siteUrl}/${locale}/blog/${slug}`,
      languages,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  if (!routing.locales.includes(rawLocale as BlogLocale)) notFound();
  const locale = rawLocale as BlogLocale;
  setRequestLocale(locale);

  const post = await getPostBySlug(locale, slug);
  if (!post) notFound();

  const [t, html, related] = await Promise.all([
    getTranslations({ locale, namespace: "blog" }),
    renderMarkdown(post.contentMd),
    getRelatedPosts(post.postId, post.category?.slug ?? null, locale),
  ]);

  const cover = coverImageUrl(post.coverImagePath);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: locale,
    mainEntityOfPage: `${siteUrl}/${locale}/blog/${slug}`,
    ...(cover && { image: [cover] }),
    author: { "@type": "Organization", name: "TODA Solutions" },
    publisher: {
      "@type": "Organization",
      name: "TODA Solutions",
      logo: { "@type": "ImageObject", url: `${siteUrl}/toda-app-icon.svg` },
    },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />

      <PageSection variant="base" id="article">
        <div className="pt-14">
          <div className="mb-group mx-auto max-w-[760px]">
            <Link
              href="/blog"
              className="type-caption hover:text-text-secondary inline-flex items-center gap-1.5 transition-colors duration-200"
            >
              ← {t("backToBlog")}
            </Link>
          </div>

          <ArticleHeader
            post={post}
            locale={locale}
            meta={`${formatDate(post.publishedAt, locale)} · ${t("minRead", {
              minutes: post.readingMinutes,
            })}`}
          />

          {/* Reader-first: the body never animates. Markdown is sanitized
              server-side in renderMarkdown (rehype-sanitize). */}
          <div className="mt-block mx-auto max-w-[760px]">
            <div className="prose-blog" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </PageSection>

      {related.length > 0 && (
        <PageSection variant="alt" id="related">
          <Animate type="fade-up">
            <SectionHeader label={t("eyebrow")} headline={t("relatedPosts")} className="mb-block" />
          </Animate>
          <PostGrid posts={related} locale={locale} />
        </PageSection>
      )}
    </article>
  );
}
