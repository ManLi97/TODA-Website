// Full blog listing section — shared by /blog and /blog/category/[slug].
// Ambient gold bloom backdrop (deck --grad-ambient), h1 header (the listing
// page owns the page's h1, so SectionHeader's h2 isn't reused here), filter
// pills, and the card grid with per-element reveals.
import { getTranslations } from "next-intl/server";
import { PageSection } from "@/components/page-section";
import { Animate } from "@/components/animate";
import { CategoryPills } from "@/components/blog/category-pills";
import { PostGrid } from "@/components/blog/post-grid";
import { getCategories, getPublishedPosts } from "@/lib/blog/queries";
import type { BlogLocale } from "@/lib/blog/types";

interface BlogListingProps {
  locale: BlogLocale;
  activeCategorySlug?: string;
}

export async function BlogListing({ locale, activeCategorySlug }: BlogListingProps) {
  const t = await getTranslations({ locale, namespace: "blog" });
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPublishedPosts(locale, activeCategorySlug),
  ]);

  return (
    <PageSection
      variant="base"
      id="blog"
      backdrop={
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "var(--grad-ambient)" }}
        />
      }
    >
      <div className="pt-14">
        <Animate type="fade-up" duration={650}>
          <div className="max-w-2xl">
            <p className="type-eyebrow text-text-tertiary mb-group">{t("eyebrow")}</p>
            <h1 className="type-display text-text-primary">{t("title")}</h1>
            <p className="type-lede mt-group">{t("lede")}</p>
          </div>
        </Animate>

        <Animate type="fade-up" delay={250} duration={550} className="mt-block mb-block">
          <CategoryPills
            categories={categories}
            locale={locale}
            allLabel={t("allPosts")}
            activeSlug={activeCategorySlug}
          />
        </Animate>

        {posts.length > 0 ? (
          <PostGrid posts={posts} locale={locale} />
        ) : (
          <p className="type-body">{t("emptyState")}</p>
        )}
      </div>
    </PageSection>
  );
}
