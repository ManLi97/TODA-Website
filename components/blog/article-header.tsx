// Article header — the one sequenced entrance cascade on the article page:
// category pill → title → meta row → cover (deck sequencing: next.delay =
// prev.delay + prev.duration + breath, with same-group overlap). The article
// BODY below never animates — reader-first.
import Image from "next/image";
import { Animate } from "@/components/animate";
import { coverImageUrl } from "@/lib/blog/queries";
import { categoryName } from "@/lib/blog/format";
import type { BlogLocale, PostArticle } from "@/lib/blog/types";

interface ArticleHeaderProps {
  post: PostArticle;
  locale: BlogLocale;
  /** Pre-formatted "date · N min read" line (parent owns translations). */
  meta: string;
}

export function ArticleHeader({ post, locale, meta }: ArticleHeaderProps) {
  const cover = coverImageUrl(post.coverImagePath);

  return (
    <header className="mx-auto max-w-[760px]">
      {post.category && (
        <Animate type="fade-up" duration={400}>
          <span className="label label--gold">{categoryName(post.category.name, locale)}</span>
        </Animate>
      )}

      <Animate type="fade-up" delay={150} duration={650}>
        <h1 className="type-article-title text-text-primary mt-group">{post.title}</h1>
      </Animate>

      <Animate type="fade-up" delay={350} duration={550}>
        <div className="mt-group flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="type-caption">{meta}</span>
          {post.tags.map((tag) => (
            <span key={tag} className="type-caption text-purple-400">
              #{tag}
            </span>
          ))}
        </div>
      </Animate>

      {cover && (
        <Animate type="scale-in" delay={600} duration={900}>
          <div
            className="mt-block elevated relative aspect-[16/9] w-full overflow-hidden rounded-[18px]"
            style={{ border: "var(--glass-border-gold)" }}
          >
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 820px) 100vw, 760px"
              className="object-cover"
            />
          </div>
        </Animate>
      )}
    </header>
  );
}
