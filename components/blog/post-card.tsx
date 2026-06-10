// Blog listing card — the shared Card visual recipe (surface-elevated,
// .elevated depth, hover border + image zoom) extended with a dim category
// pill and a date · reading-time meta row. Category pills stay neutral here
// ("jewelry over clutter") — gold is reserved for the active filter pill and
// the article header.
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { coverImageUrl } from "@/lib/blog/queries";
import { categoryName } from "@/lib/blog/format";
import type { BlogLocale, PostListItem } from "@/lib/blog/types";

interface PostCardProps {
  post: PostListItem;
  locale: BlogLocale;
  /** Pre-formatted "date · N min read" line (parent owns translations). */
  meta: string;
}

export function PostCard({ post, locale, meta }: PostCardProps) {
  const cover = coverImageUrl(post.coverImagePath);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-surface-elevated border-border-subtle elevated hover:border-text-tertiary block overflow-hidden rounded-lg border transition-[border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
    >
      {cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          {post.category && (
            <span className="label">{categoryName(post.category.name, locale)}</span>
          )}
          <span className="type-caption">{meta}</span>
        </div>
        <h3 className="text-text-primary text-[17px] leading-[1.47] font-semibold tracking-[-0.2px]">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-text-secondary mt-2 line-clamp-3 text-[14px] leading-[1.43] font-normal tracking-[-0.1px]">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
