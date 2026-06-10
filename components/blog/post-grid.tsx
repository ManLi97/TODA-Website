// Listing grid — each card reveals on its own viewport entry (RevealGroup,
// fire-once), no pre-timed cascade. Owns the date · reading-time meta line so
// PostCard stays a pure presenter.
import { getTranslations } from "next-intl/server";
import { RevealGroup } from "@/components/reveal-group";
import { PostCard } from "@/components/blog/post-card";
import { formatDate } from "@/lib/blog/format";
import type { BlogLocale, PostListItem } from "@/lib/blog/types";

interface PostGridProps {
  posts: PostListItem[];
  locale: BlogLocale;
}

export async function PostGrid({ posts, locale }: PostGridProps) {
  const t = await getTranslations({ locale, namespace: "blog" });

  return (
    <RevealGroup type="fade-up" className="gap-group grid sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          key={post.postId}
          post={post}
          locale={locale}
          meta={`${formatDate(post.publishedAt, locale)} · ${t("minRead", {
            minutes: post.readingMinutes,
          })}`}
        />
      ))}
    </RevealGroup>
  );
}
